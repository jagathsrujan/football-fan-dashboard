import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";
import type { MatchStatus } from "@prisma/client";

export type TeamFixturesPayload = {
  team: { id: string; name: string; crestUrl: string | null };
  fixtures: Array<{
    id: string;
    bucket: "recent" | "upcoming";
    competition: { id: string; name: string; code: string | null; emblemUrl: string | null };
    matchday: number | null;
    kickoffTime: string;
    status: MatchStatus;
    homeTeam: { id: string; name: string; crestUrl: string | null };
    awayTeam: { id: string; name: string; crestUrl: string | null };
    homeScore: number | null;
    awayScore: number | null;
  }>;
};

export async function getTeamFixtures(id: string): Promise<TeamFixturesPayload> {
  const key = cacheKeys.teamFixtures(id);
  const cached = await cacheGet<TeamFixturesPayload>(key);
  if (cached) return cached;

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) notFound("Team not found");

  const now = new Date();
  const include = { competition: true, homeTeam: true, awayTeam: true };
  const [recent, upcoming] = await Promise.all([
    prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ homeTeamId: id }, { awayTeamId: id }] },
          { OR: [{ status: "FINISHED" }, { kickoffTime: { lt: now } }] },
        ],
      },
      orderBy: { kickoffTime: "desc" },
      take: 5,
      include,
    }),
    prisma.match.findMany({
      where: {
        AND: [
          { OR: [{ homeTeamId: id }, { awayTeamId: id }] },
          { status: { in: ["SCHEDULED", "IN_PLAY", "PAUSED"] } },
          { kickoffTime: { gte: now } },
        ],
      },
      orderBy: { kickoffTime: "asc" },
      take: 5,
      include,
    }),
  ]);

  const mapMatch = (bucket: "recent" | "upcoming") => (match: (typeof recent)[number]) => ({
    id: match.id,
    bucket,
    competition: {
      id: match.competition.id,
      name: match.competition.name,
      code: match.competition.code,
      emblemUrl: match.competition.emblemUrl,
    },
    matchday: match.matchday,
    kickoffTime: match.kickoffTime.toISOString(),
    status: match.status,
    homeTeam: { id: match.homeTeam.id, name: match.homeTeam.name, crestUrl: match.homeTeam.crestUrl },
    awayTeam: { id: match.awayTeam.id, name: match.awayTeam.name, crestUrl: match.awayTeam.crestUrl },
    homeScore: match.homeScore,
    awayScore: match.awayScore,
  });

  const payload = {
    team: { id: team.id, name: team.name, crestUrl: team.crestUrl },
    fixtures: [...upcoming.map(mapMatch("upcoming")), ...recent.map(mapMatch("recent"))],
  };

  await cacheSet(key, payload, 300);
  return payload;
}
