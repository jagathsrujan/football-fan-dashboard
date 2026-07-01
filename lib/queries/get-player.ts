import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

export type PlayerDetailPayload = {
  player: {
    id: string;
    name: string;
    dob: string | null;
    nationality: string | null;
    position: string | null;
    photoUrl: string | null;
    currentTeam: {
      id: string;
      name: string;
      crestUrl: string | null;
      clubColors: string | null;
    } | null;
  };
};

export async function getPlayer(id: string): Promise<PlayerDetailPayload> {
  const key = cacheKeys.player(id);
  const cached = await cacheGet<PlayerDetailPayload>(key);
  if (cached) return cached;

  const player = await prisma.player.findUnique({
    where: { id },
    include: { currentTeam: true },
  });

  if (!player) notFound("Player not found");

  const payload = {
    player: {
      id: player.id,
      name: player.name,
      dob: player.dob?.toISOString() ?? null,
      nationality: player.nationality,
      position: player.position,
      photoUrl: player.photoUrl,
      currentTeam: player.currentTeam
        ? {
            id: player.currentTeam.id,
            name: player.currentTeam.name,
            crestUrl: player.currentTeam.crestUrl,
            clubColors: player.currentTeam.clubColors,
          }
        : null,
    },
  };

  await cacheSet(key, payload, 3600);
  return payload;
}
