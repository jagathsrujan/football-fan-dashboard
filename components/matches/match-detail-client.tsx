"use client";

import { BadgeAlert, CalendarClock, Goal, ListX, MapPin, Repeat2, Shield, Square } from "lucide-react";
import { Crest } from "@/components/football/crest";
import { LiveBadge } from "@/components/football/live-badge";
import { ScoreDisplay } from "@/components/football/score-display";
import { useMatchPolling } from "@/hooks/use-match-polling";
import { PageHeader } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { MatchDetailPayload } from "@/lib/queries/get-match";

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: MatchDetailPayload["match"]["status"], kickoffTime: string) {
  if (status === "IN_PLAY" || status === "PAUSED") return <LiveBadge />;
  if (status === "FINISHED") return <Badge>FT</Badge>;
  if (status === "POSTPONED" || status === "CANCELLED") return <Badge>{status}</Badge>;
  return <Badge>{formatKickoff(kickoffTime)}</Badge>;
}

function eventMeta(event: MatchDetailPayload["events"][number]) {
  const detail = event.detail?.toLowerCase() ?? "";

  if (event.type === "GOAL") {
    return { icon: Goal, label: "Goal", className: "text-win" };
  }
  if (event.type === "SUBSTITUTION") {
    return { icon: Repeat2, label: "Substitution", className: "text-floodlight" };
  }
  if (detail.includes("red")) {
    return { icon: Square, label: "Red card", className: "text-loss" };
  }
  if (detail.includes("yellow")) {
    return { icon: BadgeAlert, label: "Yellow card", className: "text-draw" };
  }
  return { icon: BadgeAlert, label: "Card", className: "text-secondary" };
}

function MatchSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-2/3" />
      <Card>
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-16 w-16" />
          <Skeleton className="h-20 w-48" />
          <Skeleton className="h-16 w-16" />
        </div>
      </Card>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function EventTimeline({ events }: { events: MatchDetailPayload["events"] }) {
  if (events.length === 0) {
    return <EmptyState icon={CalendarClock} message="No match events have been synced for this match." />;
  }

  return (
    <Card>
      <h2 className="mb-4 font-display text-2xl font-semibold">Event timeline</h2>
      <ol className="space-y-3">
        {events.map((event, index) => {
          const meta = eventMeta(event);
          const Icon = meta.icon;
          const teamLabel = event.team === "home" ? "Home" : event.team === "away" ? "Away" : "Team unavailable";
          const player = event.player ?? "Unknown player";
          const isLast = index === events.length - 1;
          return (
            <li
              key={event.id}
              aria-label={`${event.minute} minute, ${meta.label}, ${player}, ${teamLabel}`}
              className="relative flex gap-4 rounded border border-transparent py-2 pl-1 outline-none focus-visible:border-floodlight/40 focus-visible:ring-2 focus-visible:ring-floodlight/30"
              tabIndex={0}
            >
              <div className="flex w-14 shrink-0 justify-end font-data text-sm tabular-nums text-primary">{`${event.minute}'`}</div>
              <div className="relative flex flex-col items-center">
                {!isLast && <span className="absolute top-7 h-[calc(100%+0.75rem)] w-px bg-hairline" aria-hidden="true" />}
                <span className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-surface-raised">
                  <Icon className={meta.className} size={18} strokeWidth={1.75} />
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-primary">{meta.label}</p>
                <p className="text-sm text-secondary">
                  {player} · {teamLabel}
                  {event.detail ? ` · ${event.detail}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

export function MatchDetailClient({ matchId }: { matchId: string }) {
  const { data, error, isPolling, pollingLabel, refetch, status } = useMatchPolling(matchId);

  if (status === "loading" || !data) return <MatchSkeleton />;
  if (status === "error") {
    return <EmptyState icon={Shield} message={error ?? "Failed to load match"} variant="error" action={{ label: "Retry", onClick: () => void refetch() }} />;
  }

  const { match } = data;
  const matchday = match.competition.matchday ? `Matchday ${match.competition.matchday}` : "Matchday TBA";

  return (
    <div>
      <div className="mb-6">
        <PageHeader eyebrow={`${match.competition.name} · ${matchday}`} title={`${match.homeTeam.name} vs ${match.awayTeam.name}`} />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-secondary">
          <Badge variant="info">{match.competition.code ?? match.competition.name}</Badge>
          <span className="inline-flex items-center gap-1">
            <MapPin size={16} strokeWidth={1.75} />
            {match.venue ?? "Venue TBA"}
          </span>
        </div>
      </div>

      <Card className="text-center">
        <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col items-center gap-3 md:flex-row md:justify-end">
            <Crest src={match.homeTeam.crestUrl} alt={`${match.homeTeam.name} crest`} size={64} />
            <span className="max-w-56 truncate font-display text-2xl font-semibold">{match.homeTeam.name}</span>
          </div>
          <ScoreDisplay homeScore={match.homeScore} awayScore={match.awayScore} status={match.status} />
          <div className="flex flex-col items-center gap-3 md:flex-row-reverse md:justify-end">
            <Crest src={match.awayTeam.crestUrl} alt={`${match.awayTeam.name} crest`} size={64} />
            <span className="max-w-56 truncate font-display text-2xl font-semibold">{match.awayTeam.name}</span>
          </div>
        </div>
        <div className="mt-5 flex flex-col items-center justify-center gap-1.5">
          {statusLabel(match.status, match.kickoffTime)}
          {isPolling && (
            <span className="text-xs font-medium text-secondary">{pollingLabel}</span>
          )}
        </div>
      </Card>

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
        <EventTimeline events={data.events} />
        <EmptyState icon={ListX} message="Lineups not available on the free tier" />
      </section>
    </div>
  );
}
