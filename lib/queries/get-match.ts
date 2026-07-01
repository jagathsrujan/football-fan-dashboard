import type { MatchEventType, MatchStatus } from "@prisma/client";
import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

type EventTeam = "home" | "away" | null;

export type MatchDetailPayload = {
  match: {
    id: string;
    status: MatchStatus;
    kickoffTime: string;
    venue: string | null;
    homeTeam: { id: string; name: string; crestUrl: string | null };
    awayTeam: { id: string; name: string; crestUrl: string | null };
    homeScore: number | null;
    awayScore: number | null;
    competition: {
      id: string;
      name: string;
      code: string | null;
      emblemUrl: string | null;
      matchday: number | null;
    };
  };
  events: Array<{
    id: string;
    minute: number;
    type: MatchEventType;
    player: string | null;
    detail: string | null;
    team: EventTeam;
  }>;
  lineups: null;
};

function isLiveWindow(status: MatchStatus, kickoffTime: Date) {
  if (status === "IN_PLAY" || status === "PAUSED") return true;
  if (status !== "SCHEDULED") return false;

  const msUntilKickoff = kickoffTime.getTime() - Date.now();
  return msUntilKickoff >= 0 && msUntilKickoff <= 15 * 60 * 1000;
}

function eventTeam(playerTeamId: string | null | undefined, homeTeamId: string, awayTeamId: string): EventTeam {
  if (playerTeamId === homeTeamId) return "home";
  if (playerTeamId === awayTeamId) return "away";
  return null;
}

export async function getMatch(id: string): Promise<MatchDetailPayload> {
  const key = cacheKeys.match(id);
  const cached = await cacheGet<MatchDetailPayload>(key);
  if (cached) return cached;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      competition: true,
      homeTeam: true,
      awayTeam: true,
      events: {
        include: { player: true },
        orderBy: [{ minute: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!match) notFound("Match not found");

  const payload = {
    match: {
      id: match.id,
      status: match.status,
      kickoffTime: match.kickoffTime.toISOString(),
      venue: match.venue,
      homeTeam: { id: match.homeTeam.id, name: match.homeTeam.name, crestUrl: match.homeTeam.crestUrl },
      awayTeam: { id: match.awayTeam.id, name: match.awayTeam.name, crestUrl: match.awayTeam.crestUrl },
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        code: match.competition.code,
        emblemUrl: match.competition.emblemUrl,
        matchday: match.matchday,
      },
    },
    events: match.events.map((event) => ({
      id: event.id,
      minute: event.minute,
      type: event.type,
      player: event.player?.name ?? null,
      detail: event.detail,
      team: eventTeam(event.player?.currentTeamId, match.homeTeamId, match.awayTeamId),
    })),
    lineups: null,
  };

  await cacheSet(key, payload, isLiveWindow(match.status, match.kickoffTime) ? 30 : 3600);
  return payload;
}
