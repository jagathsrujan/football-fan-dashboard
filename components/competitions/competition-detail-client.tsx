"use client";

import { CalendarDays, Goal, ListOrdered, Trophy } from "lucide-react";
import { useMemo } from "react";
import { MatchCard } from "@/components/football/match-card";
import { PlayerAvatar } from "@/components/football/player-avatar";
import { StandingsTable } from "@/components/football/standings-table";
import { useApiResource } from "@/components/competitions/use-api-resource";
import { teamAccent } from "@/components/mock/data";
import { PageHeader } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Crest } from "@/components/football/crest";
import type { CompetitionDetail } from "@/lib/queries/get-competitions";
import type { FixturesPayload } from "@/lib/queries/get-fixtures";
import type { ScorersPayload } from "@/lib/queries/get-scorers";
import type { StandingRow } from "@/components/football/types";

type DetailResponse = { competition: CompetitionDetail };
type StandingsPayload = {
  competition: { id: string; name: string; code: string | null; emblemUrl: string | null };
  season: { id: string; yearLabel: string };
  standings: StandingRow[];
  zones: { promotion: number[]; relegation: number[] };
};

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-md border border-hairline bg-surface p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-9 w-12" />
        </div>
      ))}
    </div>
  );
}

function CardListSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-md border border-hairline bg-surface p-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="mt-4 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

function StandingsTab({ code }: { code: string }) {
  const { data, error, refetch, status } = useApiResource<StandingsPayload>(`/api/competitions/${code}/standings`);

  if (status === "loading") return <TableSkeleton />;
  if (status === "error") {
    return <EmptyState icon={ListOrdered} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }
  if (data.standings.length === 0) {
    return <EmptyState icon={ListOrdered} message="No standings rows are available for this competition." />;
  }
  return <StandingsTable standings={data.standings} zones={data.zones} />;
}

function ScorersTab({ code }: { code: string }) {
  const { data, error, refetch, status } = useApiResource<ScorersPayload>(`/api/competitions/${code}/scorers`);

  if (status === "loading") return <CardListSkeleton />;
  if (status === "error") {
    return <EmptyState icon={Goal} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }
  if (data.scorers.length === 0) {
    return <EmptyState icon={Goal} message="No scorer stats have been synced for this season." />;
  }

  return (
    <div className="grid gap-3">
      {data.scorers.map((scorer) => (
        <Card key={scorer.player.id} className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <PlayerAvatar name={scorer.player.name} photoUrl={scorer.player.photoUrl} teamAccent={teamAccent} />
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{scorer.player.name}</h2>
              <p className="truncate text-sm text-secondary">{scorer.team.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-semibold">{scorer.goals}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-secondary">Goals</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FixturesTab({ code }: { code: string }) {
  const { data, error, refetch, status } = useApiResource<FixturesPayload>(`/api/competitions/${code}/fixtures`);

  const grouped = useMemo(() => {
    const groups = new Map<string, FixturesPayload["fixtures"]>();
    for (const fixture of data?.fixtures ?? []) {
      const label = fixture.matchday ? `Matchday ${fixture.matchday}` : "Unscheduled";
      groups.set(label, [...(groups.get(label) ?? []), fixture]);
    }
    return Array.from(groups.entries());
  }, [data]);

  if (status === "loading") return <CardListSkeleton />;
  if (status === "error") {
    return <EmptyState icon={CalendarDays} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }
  if (data.fixtures.length === 0) {
    return <EmptyState icon={CalendarDays} message="No fixtures match this competition filter." />;
  }

  return (
    <div className="space-y-6">
      {grouped.map(([matchday, fixtures]) => (
        <section key={matchday}>
          <h2 className="mb-3 font-display text-2xl font-semibold">{matchday}</h2>
          <div className="grid gap-4 xl:grid-cols-3">
            {fixtures.map((fixture) => (
              <MatchCard
                key={fixture.id}
                match={{
                  id: fixture.id,
                  competition: data.competition.name,
                  kickoffTime: new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(fixture.kickoffTime)),
                  status: fixture.status,
                  homeTeam: fixture.homeTeam,
                  awayTeam: fixture.awayTeam,
                  homeScore: fixture.homeScore,
                  awayScore: fixture.awayScore,
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CompetitionDetailClient({ code }: { code: string }) {
  const { data, error, refetch, status } = useApiResource<DetailResponse>(`/api/competitions/${code}`);

  if (status === "loading") {
    return (
      <div>
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="mt-4 h-16 w-full" />
        <div className="mt-6">
          <TableSkeleton />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return <EmptyState icon={Trophy} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }

  const competition = data.competition;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Crest src={competition.emblemUrl} alt={`${competition.name} emblem`} size={64} />
        <div>
          <PageHeader eyebrow="Competition" title={competition.name} />
          <div className="flex flex-wrap gap-2">
            <Badge>{competition.code ?? code}</Badge>
            <Badge variant="info">{competition.currentSeason?.yearLabel ?? "No current season"}</Badge>
          </div>
        </div>
      </div>
      <Tabs
        tabs={[
          { id: "table", label: "Table", content: <StandingsTab code={code} /> },
          { id: "scorers", label: "Scorers", content: <ScorersTab code={code} /> },
          { id: "fixtures", label: "Fixtures", content: <FixturesTab code={code} /> },
        ]}
      />
      <div className="mt-6">
        <Button variant="secondary" onClick={refetch}>
          Refresh competition
        </Button>
      </div>
    </div>
  );
}
