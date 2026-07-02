"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { MatchDetailPayload } from "@/lib/queries/get-match";
import { toastGoal } from "@/components/ui/toast-stack";

export function shouldPollMatch(status: string, kickoffTime: string): boolean {
  if (status === "FINISHED" || status === "POSTPONED" || status === "CANCELLED") {
    return false;
  }
  if (status === "IN_PLAY" || status === "PAUSED") {
    return true;
  }
  if (status === "SCHEDULED") {
    const kickoffMs = new Date(kickoffTime).getTime();
    const nowMs = Date.now();
    const diffMin = (kickoffMs - nowMs) / (1000 * 60);
    // Poll if match starts within 15 minutes or started within the last 3 hours
    return diffMin <= 15 && diffMin >= -180;
  }
  return false;
}

export function useMatchPolling(matchId: string) {
  const seenEventIds = useRef<Set<string> | null>(null);

  const query = useQuery<MatchDetailPayload, Error>({
    queryKey: ["match", matchId],
    queryFn: async () => {
      const response = await fetch(`/api/matches/${matchId}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to fetch match");
      }
      return payload as MatchDetailPayload;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const { status, kickoffTime } = data.match;
      return shouldPollMatch(status, kickoffTime) ? 30000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const data = query.data;

  useEffect(() => {
    if (!data) return;

    if (seenEventIds.current === null) {
      // First load: initialize seen IDs without triggering toasts
      seenEventIds.current = new Set(data.events.map((e) => e.id));
      return;
    }

    // Subsequent updates: check for new goal events
    data.events.forEach((event) => {
      if (event.type === "GOAL" && !seenEventIds.current?.has(event.id)) {
        seenEventIds.current?.add(event.id);
        const isHome = event.team === "home";
        const teamName = isHome
          ? data.match.homeTeam.name
          : event.team === "away"
            ? data.match.awayTeam.name
            : "Team";
        const teamCrest = isHome
          ? data.match.homeTeam.crestUrl
          : event.team === "away"
            ? data.match.awayTeam.crestUrl
            : null;

        toastGoal({
          scorer: event.player ?? "Goal",
          teamName,
          teamCrest,
          minute: event.minute,
        });
      } else if (!seenEventIds.current?.has(event.id)) {
        seenEventIds.current?.add(event.id);
      }
    });
  }, [data]);

  const isPolling = data ? shouldPollMatch(data.match.status, data.match.kickoffTime) : false;

  return {
    data: query.data ?? null,
    error: query.error?.message ?? null,
    status: query.status === "pending" ? "loading" : query.status === "error" ? "error" : "success",
    refetch: query.refetch,
    isPolling,
    pollingLabel: "updates automatically",
  };
}
