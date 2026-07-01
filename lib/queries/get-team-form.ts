import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

export type TeamFormPayload = {
  team: { id: string; name: string; crestUrl: string | null };
  results: Array<"W" | "D" | "L">;
  trend: Array<{ label: string; goalsFor: number; goalsAgainst: number }>;
};

export async function getTeamForm(id: string): Promise<TeamFormPayload> {
  const key = cacheKeys.teamForm(id);
  const cached = await cacheGet<TeamFormPayload>(key);
  if (cached) return cached;

  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) notFound("Team not found");

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: id }, { awayTeamId: id }],
      status: "FINISHED",
      homeScore: { not: null },
      awayScore: { not: null },
    },
    orderBy: { kickoffTime: "desc" },
    take: 10,
    include: { homeTeam: true, awayTeam: true },
  });

  const chronological = [...matches].reverse();
  const results = chronological.map((match) => {
    const isHome = match.homeTeamId === id;
    const goalsFor = isHome ? match.homeScore ?? 0 : match.awayScore ?? 0;
    const goalsAgainst = isHome ? match.awayScore ?? 0 : match.homeScore ?? 0;
    if (goalsFor > goalsAgainst) return "W";
    if (goalsFor < goalsAgainst) return "L";
    return "D";
  });

  const trend = chronological.map((match) => {
    const isHome = match.homeTeamId === id;
    return {
      label: match.matchday ? `MD ${match.matchday}` : new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(match.kickoffTime),
      goalsFor: isHome ? match.homeScore ?? 0 : match.awayScore ?? 0,
      goalsAgainst: isHome ? match.awayScore ?? 0 : match.homeScore ?? 0,
    };
  });

  const payload = {
    team: { id: team.id, name: team.name, crestUrl: team.crestUrl },
    results,
    trend,
  };

  await cacheSet(key, payload, 3600);
  return payload;
}
