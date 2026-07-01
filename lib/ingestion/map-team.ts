import { Prisma } from "@prisma/client";
import type { FootballDataPlayer, FootballDataTeam } from "@/lib/football-data-client";

export function mapTeam(team: FootballDataTeam, federationId?: string | null, type: "CLUB" | "NATIONAL" = "CLUB") {
  return {
    footballDataId: team.id,
    name: team.name,
    shortName: team.shortName ?? team.tla ?? null,
    type,
    country: team.area?.name ?? null,
    federationId: federationId ?? null,
    crestUrl: team.crest ?? null,
    clubColors: team.clubColors ?? null,
  } satisfies Prisma.TeamUncheckedCreateInput;
}

function position(value?: string | null): "GK" | "DEF" | "MID" | "FWD" | null {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("goal")) return "GK";
  if (normalized.includes("def")) return "DEF";
  if (normalized.includes("mid")) return "MID";
  if (normalized.includes("wing") || normalized.includes("forward") || normalized.includes("offence") || normalized.includes("attack")) return "FWD";
  return null;
}

export function mapPlayer(player: FootballDataPlayer, currentTeamId: string) {
  return {
    footballDataId: player.id,
    name: player.name,
    dob: player.dateOfBirth ? new Date(player.dateOfBirth) : null,
    nationality: player.nationality ?? null,
    position: position(player.position),
    currentTeamId,
    photoUrl: null,
  } satisfies Prisma.PlayerUncheckedCreateInput;
}
