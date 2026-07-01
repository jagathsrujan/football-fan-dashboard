import { Prisma } from "@prisma/client";
import type { FootballDataMatch } from "@/lib/football-data-client";

function status(value: string): Prisma.MatchUncheckedCreateInput["status"] {
  switch (value) {
    case "LIVE":
    case "IN_PLAY":
      return "IN_PLAY";
    case "PAUSED":
      return "PAUSED";
    case "FINISHED":
      return "FINISHED";
    case "POSTPONED":
      return "POSTPONED";
    case "CANCELLED":
    case "SUSPENDED":
      return "CANCELLED";
    default:
      return "SCHEDULED";
  }
}

export function mapMatch(match: FootballDataMatch, competitionId: string, seasonId: string, homeTeamId: string, awayTeamId: string) {
  return {
    footballDataId: match.id,
    competitionId,
    seasonId,
    homeTeamId,
    awayTeamId,
    kickoffTime: new Date(match.utcDate),
    venue: match.venue ?? null,
    matchday: match.matchday ?? null,
    status: status(match.status),
    homeScore: match.score?.fullTime?.home ?? null,
    awayScore: match.score?.fullTime?.away ?? null,
  } satisfies Prisma.MatchUncheckedCreateInput;
}
