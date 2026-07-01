import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

export type TeamDetailPayload = {
  team: {
    id: string;
    name: string;
    shortName: string | null;
    crestUrl: string | null;
    country: string | null;
    clubColors: string | null;
    competitions: Array<{ id: string; name: string; code: string | null; emblemUrl: string | null }>;
  };
};

export async function getTeam(id: string): Promise<TeamDetailPayload> {
  const key = cacheKeys.team(id);
  const cached = await cacheGet<TeamDetailPayload>(key);
  if (cached) return cached;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      standings: {
        include: { competition: true },
        orderBy: { position: "asc" },
      },
      homeMatches: {
        include: { competition: true },
        orderBy: { kickoffTime: "desc" },
        take: 10,
      },
      awayMatches: {
        include: { competition: true },
        orderBy: { kickoffTime: "desc" },
        take: 10,
      },
    },
  });

  if (!team) notFound("Team not found");

  const competitionMap = new Map<string, { id: string; name: string; code: string | null; emblemUrl: string | null }>();
  for (const standing of team.standings) {
    competitionMap.set(standing.competition.id, {
      id: standing.competition.id,
      name: standing.competition.name,
      code: standing.competition.code,
      emblemUrl: standing.competition.emblemUrl,
    });
  }
  for (const match of [...team.homeMatches, ...team.awayMatches]) {
    competitionMap.set(match.competition.id, {
      id: match.competition.id,
      name: match.competition.name,
      code: match.competition.code,
      emblemUrl: match.competition.emblemUrl,
    });
  }

  const payload = {
    team: {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      crestUrl: team.crestUrl,
      country: team.country,
      clubColors: team.clubColors,
      competitions: Array.from(competitionMap.values()),
    },
  };

  await cacheSet(key, payload, 3600);
  return payload;
}
