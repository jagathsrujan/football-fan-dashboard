"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Grid3X3,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Crest } from "@/components/football/crest";
import { LiveBadge } from "@/components/football/live-badge";
import { ScoreDisplay } from "@/components/football/score-display";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { shouldPollMatch } from "@/hooks/use-match-polling";
import type { SchedulePayload, ScheduleDay, ScheduleFixture } from "@/lib/queries/get-schedule";
import type { MatchStatus } from "@/components/football/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function weekRange(offset = 0): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7) + offset * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { dateFrom: toDateString(monday), dateTo: toDateString(sunday) };
}

function weekLabel(dateFrom: string): string {
  const d = new Date(`${dateFrom}T00:00:00Z`);
  const now = new Date();
  const thisMonday = new Date(now);
  thisMonday.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  const thisMondayStr = toDateString(thisMonday);
  if (dateFrom === thisMondayStr) return "This Week";
  const nextMonday = new Date(thisMonday);
  nextMonday.setUTCDate(thisMonday.getUTCDate() + 7);
  if (dateFrom === toDateString(nextMonday)) return "Next Week";
  const prevMonday = new Date(thisMonday);
  prevMonday.setUTCDate(thisMonday.getUTCDate() - 7);
  if (dateFrom === toDateString(prevMonday)) return "Last Week";
  return `Week of ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function kickoffTimeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-md border border-hairline bg-surface p-4">
          <Skeleton className="mb-3 h-5 w-28" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function WeekGridSkeleton() {
  return (
    <div className="grid min-w-[700px] grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="min-h-32 rounded border border-hairline bg-surface p-3">
          <Skeleton className="mb-2 h-4 w-12" />
          <Skeleton className="mb-1 h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match row (list view)
// ---------------------------------------------------------------------------

function StatusBadge({ status, kickoffTime }: { status: MatchStatus; kickoffTime: string }) {
  if (status === "IN_PLAY" || status === "PAUSED") return <LiveBadge />;
  if (status === "FINISHED") return <Badge>FT</Badge>;
  if (status === "POSTPONED") return <Badge variant="loss">PPD</Badge>;
  if (status === "CANCELLED") return <Badge variant="loss">CAN</Badge>;
  return <Badge>{kickoffTimeLabel(kickoffTime)}</Badge>;
}

function MatchRow({ fixture }: { fixture: ScheduleFixture }) {
  return (
    <Link
      href={`/matches/${fixture.id}`}
      className="flex items-center gap-3 rounded px-3 py-2 transition-colors hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-floodlight/40 outline-none"
    >
      {/* Competition crest */}
      <Crest src={fixture.competition.emblemUrl} alt={`${fixture.competition.name} crest`} size={20} className="hidden sm:block" />

      {/* Teams */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Crest src={fixture.homeTeam.crestUrl} alt={`${fixture.homeTeam.name} crest`} size={20} />
          <span className="truncate text-sm font-semibold">{fixture.homeTeam.name}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Crest src={fixture.awayTeam.crestUrl} alt={`${fixture.awayTeam.name} crest`} size={20} />
          <span className="truncate text-sm font-semibold">{fixture.awayTeam.name}</span>
        </div>
      </div>

      {/* Score */}
      <div className="shrink-0">
        <ScoreDisplay homeScore={fixture.homeScore} awayScore={fixture.awayScore} status={fixture.status as MatchStatus} />
      </div>

      {/* Status */}
      <div className="hidden shrink-0 sm:block">
        <StatusBadge status={fixture.status as MatchStatus} kickoffTime={fixture.kickoffTime} />
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Week grid chip (compact)
// ---------------------------------------------------------------------------

function WeekGridChip({ fixture }: { fixture: ScheduleFixture }) {
  const isLive = fixture.status === "IN_PLAY" || fixture.status === "PAUSED";
  const isFinished = fixture.status === "FINISHED";

  return (
    <Link
      href={`/matches/${fixture.id}`}
      className={cn(
        "flex min-h-[36px] items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors outline-none",
        "hover:border-floodlight/40 focus-visible:ring-2 focus-visible:ring-floodlight/40",
        isLive ? "border-live/40 bg-live/10" : "border-hairline bg-surface-raised",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <Crest src={fixture.homeTeam.crestUrl} alt={`${fixture.homeTeam.name} crest`} size={14} />
          <span className="truncate font-medium">{fixture.homeTeam.name}</span>
          {(isFinished || isLive) && (
            <span className="ml-auto font-data tabular-nums text-primary">{fixture.homeScore ?? "–"}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Crest src={fixture.awayTeam.crestUrl} alt={`${fixture.awayTeam.name} crest`} size={14} />
          <span className="truncate font-medium">{fixture.awayTeam.name}</span>
          {(isFinished || isLive) && (
            <span className="ml-auto font-data tabular-nums text-primary">{fixture.awayScore ?? "–"}</span>
          )}
        </div>
      </div>
      {isLive && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-live" aria-label="Live" />
      )}
      {!isLive && !isFinished && (
        <span className="shrink-0 text-[10px] text-muted">{kickoffTimeLabel(fixture.kickoffTime)}</span>
      )}
      {isFinished && (
        <span className="shrink-0 text-[10px] text-muted">FT</span>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// List View
// ---------------------------------------------------------------------------

function ListView({ days, selectedCompetitions }: { days: ScheduleDay[]; selectedCompetitions: Set<string> }) {
  const filteredDays = useMemo(() => {
    return days
      .map((day) => ({
        ...day,
        fixtures: selectedCompetitions.size > 0
          ? day.fixtures.filter((f) => selectedCompetitions.has(f.competition.id))
          : day.fixtures,
      }))
      .filter((day) => day.fixtures.length > 0);
  }, [days, selectedCompetitions]);

  if (filteredDays.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        message="No matches this week. Adjust your filters or navigate to another week."
      />
    );
  }

  return (
    <div className="space-y-4">
      {filteredDays.map((day) => (
        <section key={day.date} className="rounded-md border border-hairline bg-surface">
          <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
            <CalendarDays size={16} strokeWidth={1.75} className="text-secondary" />
            <h3 className="text-sm font-semibold text-primary">{day.label}</h3>
            <span className="text-xs text-muted">{day.date}</span>
            <span className="ml-auto font-data text-xs text-secondary">{day.fixtures.length} match{day.fixtures.length !== 1 ? "es" : ""}</span>
          </div>
          <div className="divide-y divide-hairline">
            {day.fixtures.map((fixture) => (
              <MatchRow key={fixture.id} fixture={fixture} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Week Grid View
// ---------------------------------------------------------------------------

function WeekGridView({ days, selectedCompetitions }: { days: ScheduleDay[]; selectedCompetitions: Set<string> }) {
  const filteredDays = useMemo(() => {
    return days.map((day) => ({
      ...day,
      fixtures: selectedCompetitions.size > 0
        ? day.fixtures.filter((f) => selectedCompetitions.has(f.competition.id))
        : day.fixtures,
    }));
  }, [days, selectedCompetitions]);

  const isEmpty = filteredDays.every((d) => d.fixtures.length === 0);

  if (isEmpty) {
    return (
      <EmptyState
        icon={CalendarDays}
        message="No matches scheduled this week."
      />
    );
  }

  return (
    <div className="overflow-x-auto overscroll-x-contain pb-2">
      <div className="grid min-w-[700px] grid-cols-7 gap-2">
        {filteredDays.slice(0, 7).map((day) => {
          const isToday = day.label === "Today";
          return (
            <div
              key={day.date}
              className={cn(
                "min-h-32 rounded border p-2",
                isToday ? "border-floodlight/40 bg-surface" : "border-hairline bg-surface",
              )}
            >
              <p className={cn(
                "mb-2 text-xs font-medium uppercase tracking-wider",
                isToday ? "text-floodlight" : "text-secondary",
              )}>
                {day.label}
              </p>
              <div className="space-y-1.5">
                {day.fixtures.map((fixture) => (
                  <WeekGridChip key={fixture.id} fixture={fixture} />
                ))}
                {day.fixtures.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted">No matches</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter Bar
// ---------------------------------------------------------------------------

function FilterBar({
  competitions,
  selected,
  onToggle,
  onClear,
}: {
  competitions: Array<{ id: string; name: string; code: string | null; emblemUrl: string | null }>;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Competition filters">
      {competitions.map((comp) => {
        const active = selected.has(comp.id);
        return (
          <button
            key={comp.id}
            onClick={() => onToggle(comp.id)}
            type="button"
            className="outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40 rounded-full"
          >
            <Badge variant={active ? "info" : "neutral"} className="gap-1.5">
              <Crest src={comp.emblemUrl} alt={`${comp.name} crest`} size={14} />
              {comp.name}
              {active && <X size={12} strokeWidth={2} className="ml-0.5" aria-hidden="true" />}
            </Badge>
          </button>
        );
      })}
      {selected.size > 0 && (
        <button
          onClick={onClear}
          type="button"
          className="text-xs text-secondary underline-offset-2 hover:text-primary hover:underline outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40 rounded"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Client
// ---------------------------------------------------------------------------

type ViewMode = "list" | "grid";

export function ScheduleClient() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedCompetitions, setSelectedCompetitions] = useState<Set<string>>(new Set());
  const { dateFrom, dateTo } = useMemo(() => weekRange(weekOffset), [weekOffset]);
  const currentWeekLabel = useMemo(() => weekLabel(dateFrom), [dateFrom]);

  const query = useQuery<SchedulePayload, Error>({
    queryKey: ["schedule", dateFrom, dateTo],
    queryFn: async () => {
      const res = await fetch(`/api/schedule?dateFrom=${dateFrom}&dateTo=${dateTo}`, { cache: "no-store" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to load schedule");
      }
      return res.json() as Promise<SchedulePayload>;
    },
    refetchInterval: (q) => {
      const payload = q.state.data;
      if (!payload) return false;
      const hasActive = payload.days.some((day) =>
        day.fixtures.some((f) => shouldPollMatch(f.status, f.kickoffTime))
      );
      return hasActive ? 30000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const data = query.data ?? null;
  const loading = query.status === "pending";
  const error = query.error?.message ?? null;
  const fetchSchedule = () => void query.refetch();

  const isPolling = useMemo(() => {
    if (!data) return false;
    return data.days.some((day) =>
      day.fixtures.some((f) => shouldPollMatch(f.status, f.kickoffTime))
    );
  }, [data]);

  function toggleCompetition(id: string) {
    setSelectedCompetitions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-secondary">Calendar</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Schedule</h1>
      </div>

      {/* Controls bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Week navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            aria-label="Previous week"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft size={18} strokeWidth={1.75} />
          </Button>
          <span className="min-w-[110px] text-center text-sm font-semibold">{currentWeekLabel}</span>
          <Button
            variant="ghost"
            aria-label="Next week"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="h-8 w-8 p-0"
          >
            <ChevronRight size={18} strokeWidth={1.75} />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" onClick={() => setWeekOffset(0)} className="h-8 text-xs">
              Today
            </Button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="ml-auto flex items-center gap-1 rounded border border-hairline p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40",
              view === "list" ? "bg-surface-raised text-primary" : "text-secondary hover:text-primary",
            )}
            aria-label="List view"
            aria-pressed={view === "list"}
          >
            <List size={14} strokeWidth={1.75} />
            List
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40",
              view === "grid" ? "bg-surface-raised text-primary" : "text-secondary hover:text-primary",
            )}
            aria-label="Week grid view"
            aria-pressed={view === "grid"}
          >
            <Grid3X3 size={14} strokeWidth={1.75} />
            Week
          </button>
        </div>

        {/* My teams stub (Phase 4) */}
        <button
          type="button"
          disabled
          className="flex h-8 items-center gap-1.5 rounded border border-hairline px-2.5 text-xs font-medium text-muted opacity-50 cursor-not-allowed"
          title="Sign in to filter by your favorite teams (coming soon)"
        >
          <Star size={14} strokeWidth={1.75} />
          My teams
        </button>
      </div>

      {/* Competition filter pills */}
      {data && data.competitions.length > 0 && (
        <div className="mb-5">
          <FilterBar
            competitions={data.competitions}
            selected={selectedCompetitions}
            onToggle={toggleCompetition}
            onClear={() => setSelectedCompetitions(new Set())}
          />
        </div>
      )}

      {/* Live-window indicator */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted">
        <Clock size={14} strokeWidth={1.75} />
        {isPolling ? (
          <>
            <span className="font-medium text-win">Active match window</span>
            <span className="text-secondary">updates automatically</span>
          </>
        ) : (
          <span>updates automatically during live match windows</span>
        )}
      </div>

      {/* Content */}
      {loading && (view === "list" ? <ScheduleSkeleton /> : <WeekGridSkeleton />)}

      {error && (
        <EmptyState
          icon={CalendarDays}
          message={error}
          variant="error"
          action={{ label: "Retry", onClick: fetchSchedule }}
        />
      )}

      {!loading && !error && data && (
        view === "list" ? (
          <ListView days={data.days} selectedCompetitions={selectedCompetitions} />
        ) : (
          <WeekGridView days={data.days} selectedCompetitions={selectedCompetitions} />
        )
      )}
    </div>
  );
}
