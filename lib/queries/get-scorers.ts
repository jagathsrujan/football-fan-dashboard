import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { getCompetitionByCode } from "@/lib/queries/get-competitions";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

export type ScorersPayload = {
  competition: { id: string; name: string; code: string | null; emblemUrl: string | null };
  season: { id: string; yearLabel: string };
  scorers: Array<{
    rank: number;
    player: { id: string; name: string; photoUrl: string | null; position: string | null };
    team: { id: string; name: string; crestUrl: string | null };
    goals: number;
    assists: number;
  }>;
};

export async function getScorers(code: string): Promise<ScorersPayload> {
  const competition = await getCompetitionByCode(code);
  if (!competition.currentSeason) notFound("Current season not found");

  const key = cacheKeys.scorers(competition.id, competition.currentSeason.id);
  const cached = await cacheGet<ScorersPayload>(key);
  if (cached) return cached;

  const rows = await prisma.playerSeasonStat.findMany({
    where: { seasonId: competition.currentSeason.id },
    orderBy: [{ goals: "desc" }, { assists: "desc" }],
    take: 20,
    include: { player: true, team: true },
  });

  const payload = {
    competition: {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      emblemUrl: competition.emblemUrl,
    },
    season: { id: competition.currentSeason.id, yearLabel: competition.currentSeason.yearLabel },
    scorers: rows.map((row, index) => ({
      rank: index + 1,
      player: {
        id: row.player.id,
        name: row.player.name,
        photoUrl: row.player.photoUrl,
        position: row.player.position,
      },
      team: { id: row.team.id, name: row.team.name, crestUrl: row.team.crestUrl },
      goals: row.goals,
      assists: row.assists,
    })),
  };

  await cacheSet(key, payload, 3600);
  return payload;
}
