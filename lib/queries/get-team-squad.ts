import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

type Position = "GK" | "DEF" | "MID" | "FWD";

export type TeamSquadPayload = {
  team: { id: string; name: string; crestUrl: string | null };
  season: { id: string; yearLabel: string } | null;
  squad: Record<Position, Array<{
    id: string;
    name: string;
    position: Position | null;
    nationality: string | null;
    photoUrl: string | null;
    shirtNumber: number | null;
  }>>;
};

const emptySquad = (): TeamSquadPayload["squad"] => ({ GK: [], DEF: [], MID: [], FWD: [] });

export async function getTeamSquad(id: string): Promise<TeamSquadPayload> {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      squadMemberships: {
        include: { season: true },
        orderBy: { season: { startDate: "desc" } },
        take: 1,
      },
    },
  });

  if (!team) notFound("Team not found");

  const latestSeason = team.squadMemberships[0]?.season ?? null;
  const key = cacheKeys.squad(id, latestSeason?.id ?? "none");
  const cached = await cacheGet<TeamSquadPayload>(key);
  if (cached) return cached;

  const memberships = latestSeason
    ? await prisma.squadMembership.findMany({
        where: { teamId: id, seasonId: latestSeason.id },
        include: { player: true },
        orderBy: [{ player: { position: "asc" } }, { player: { name: "asc" } }],
      })
    : [];

  const squad = emptySquad();
  for (const membership of memberships) {
    const position = membership.player.position ?? "MID";
    squad[position].push({
      id: membership.player.id,
      name: membership.player.name,
      position: membership.player.position,
      nationality: membership.player.nationality,
      photoUrl: membership.player.photoUrl,
      shirtNumber: membership.shirtNumber,
    });
  }

  const payload = {
    team: { id: team.id, name: team.name, crestUrl: team.crestUrl },
    season: latestSeason ? { id: latestSeason.id, yearLabel: latestSeason.yearLabel } : null,
    squad,
  };

  await cacheSet(key, payload, 3600);
  return payload;
}
