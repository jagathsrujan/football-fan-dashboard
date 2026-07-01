import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

export type PlayerStatsPayload = {
  clubStats: Array<{
    season: string;
    team: string;
    appearances: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutes: number;
  }>;
  internationalStats: {
    federation: string;
    caps: number;
    goals: number;
  } | null;
};

export async function getPlayerStats(id: string): Promise<PlayerStatsPayload> {
  const key = cacheKeys.playerStats(id);
  const cached = await cacheGet<PlayerStatsPayload>(key);
  if (cached) return cached;

  const player = await prisma.player.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!player) notFound("Player not found");

  const [clubRows, internationalRow] = await Promise.all([
    prisma.playerSeasonStat.findMany({
      where: { playerId: id },
      include: { season: true, team: true },
      orderBy: [{ season: { startDate: "desc" } }, { team: { name: "asc" } }],
    }),
    prisma.playerInternationalStat.findFirst({
      where: { playerId: id },
      include: { federation: true },
      orderBy: { goals: "desc" },
    }),
  ]);

  const payload = {
    clubStats: clubRows.map((row) => ({
      season: row.season.yearLabel,
      team: row.team.name,
      appearances: row.appearances,
      goals: row.goals,
      assists: row.assists,
      yellowCards: row.yellowCards,
      redCards: row.redCards,
      minutes: row.minutes,
    })),
    internationalStats: internationalRow
      ? {
          federation: internationalRow.federation.name,
          caps: internationalRow.caps,
          goals: internationalRow.goals,
        }
      : null,
  };

  await cacheSet(key, payload, 3600);
  return payload;
}
