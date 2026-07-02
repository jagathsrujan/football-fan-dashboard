import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { getCompetitionByCode } from "@/lib/queries/get-competitions";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

type StandingPayload = {
  competition: { id: string; name: string; code: string | null; emblemUrl: string | null };
  season: { id: string; yearLabel: string };
  standings: Array<{
    position: number;
    team: { id: string; name: string; crestUrl: string | null };
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }>;
  zones: { promotion: number[]; relegation: number[] };
};

export function computeZones(type: string, tier: number | null, rowCount: number) {
  if (type !== "LEAGUE") return { promotion: [], relegation: [] };
  const promotion = tier === 1 ? [1, 2, 3, 4].filter((position) => position <= rowCount) : [1, 2].filter((position) => position <= rowCount);
  const relegationStart = Math.max(rowCount - 2, 1);
  const relegation = rowCount >= 10 ? Array.from({ length: rowCount - relegationStart + 1 }, (_, index) => relegationStart + index) : [];
  return { promotion, relegation };
}

export async function getStandings(code: string): Promise<StandingPayload> {
  const competition = await getCompetitionByCode(code);
  if (!competition.currentSeason) notFound("Current season not found");

  const key = cacheKeys.standings(competition.id, competition.currentSeason.id);
  const cached = await cacheGet<StandingPayload>(key);
  if (cached) return cached;

  const standings = await prisma.standing.findMany({
    where: { competitionId: competition.id, seasonId: competition.currentSeason.id },
    orderBy: { position: "asc" },
    include: { team: true },
  });

  const rows = standings.map((row) => ({
    position: row.position,
    team: { id: row.team.id, name: row.team.name, crestUrl: row.team.crestUrl },
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    points: row.points,
  }));

  const payload = {
    competition: {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      emblemUrl: competition.emblemUrl,
    },
    season: { id: competition.currentSeason.id, yearLabel: competition.currentSeason.yearLabel },
    standings: rows,
    zones: computeZones(competition.type, competition.tier, rows.length),
  };

  await cacheSet(key, payload, 3600);
  return payload;
}
