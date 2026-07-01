import type { MatchStatus } from "@prisma/client";
import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { getCompetitionByCode } from "@/lib/queries/get-competitions";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

export type FixturesPayload = {
  competition: { id: string; name: string; code: string | null; emblemUrl: string | null };
  season: { id: string; yearLabel: string };
  fixtures: Array<{
    id: string;
    matchday: number | null;
    kickoffTime: string;
    status: MatchStatus;
    homeTeam: { id: string; name: string; crestUrl: string | null };
    awayTeam: { id: string; name: string; crestUrl: string | null };
    homeScore: number | null;
    awayScore: number | null;
  }>;
};

export async function getFixtures(code: string, filters: { status?: string | null; matchday?: string | null } = {}): Promise<FixturesPayload> {
  const competition = await getCompetitionByCode(code);
  if (!competition.currentSeason) notFound("Current season not found");

  const queryKey = `${filters.status ?? "all"}:${filters.matchday ?? "all"}`;
  const key = cacheKeys.fixtures(competition.id, competition.currentSeason.id, queryKey);
  const cached = await cacheGet<FixturesPayload>(key);
  if (cached) return cached;

  const status = filters.status && ["SCHEDULED", "IN_PLAY", "PAUSED", "FINISHED", "POSTPONED", "CANCELLED"].includes(filters.status)
    ? (filters.status as MatchStatus)
    : undefined;
  const matchday = filters.matchday ? Number(filters.matchday) : undefined;

  const matches = await prisma.match.findMany({
    where: {
      competitionId: competition.id,
      seasonId: competition.currentSeason.id,
      ...(status ? { status } : {}),
      ...(Number.isFinite(matchday) ? { matchday } : {}),
    },
    orderBy: [{ matchday: "asc" }, { kickoffTime: "asc" }],
    include: { homeTeam: true, awayTeam: true },
  });

  const payload = {
    competition: {
      id: competition.id,
      name: competition.name,
      code: competition.code,
      emblemUrl: competition.emblemUrl,
    },
    season: { id: competition.currentSeason.id, yearLabel: competition.currentSeason.yearLabel },
    fixtures: matches.map((match) => ({
      id: match.id,
      matchday: match.matchday,
      kickoffTime: match.kickoffTime.toISOString(),
      status: match.status,
      homeTeam: { id: match.homeTeam.id, name: match.homeTeam.name, crestUrl: match.homeTeam.crestUrl },
      awayTeam: { id: match.awayTeam.id, name: match.awayTeam.name, crestUrl: match.awayTeam.crestUrl },
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    })),
  };

  await cacheSet(key, payload, 300);
  return payload;
}
