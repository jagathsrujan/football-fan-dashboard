"use client";

import { CalendarDays, Star, TrendingUp, Users } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MatchCard } from "@/components/football/match-card";
import { PlayerCard } from "@/components/football/player-card";
import { Crest } from "@/components/football/crest";
import { FormGuide } from "@/components/football/form-guide";
import { useApiResource } from "@/components/competitions/use-api-resource";
import { PageHeader } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import type { TeamDetailPayload } from "@/lib/queries/get-team";
import type { TeamFixturesPayload } from "@/lib/queries/get-team-fixtures";
import type { TeamFormPayload } from "@/lib/queries/get-team-form";
import type { TeamSquadPayload } from "@/lib/queries/get-team-squad";

type Position = "GK" | "DEF" | "MID" | "FWD";
const positions: Position[] = ["GK", "DEF", "MID", "FWD"];

function CardListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="rounded-md border border-hairline bg-surface p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="mt-4 h-6 w-2/3" />
          <Skeleton className="mt-2 h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function SquadTab({ teamId }: { teamId: string }) {
  const { data, error, refetch, status } = useApiResource<TeamSquadPayload>(`/api/teams/${teamId}/squad`);

  if (status === "loading") return <CardListSkeleton />;
  if (status === "error") {
    return <EmptyState icon={Users} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }

  const totalPlayers = positions.reduce((total, position) => total + data.squad[position].length, 0);
  if (totalPlayers === 0) {
    return <EmptyState icon={Users} message="No squad players have been synced for this team." />;
  }

  return (
    <div className="space-y-8">
      {positions.map((position) => {
        const players = data.squad[position];
        if (players.length === 0) return null;
        return (
          <section key={position}>
            <h2 className="mb-3 font-display text-2xl font-semibold">{position}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  name={player.name}
                  position={player.position ?? position}
                  team={data.team.name}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FixturesTab({ teamId }: { teamId: string }) {
  const { data, error, refetch, status } = useApiResource<TeamFixturesPayload>(`/api/teams/${teamId}/fixtures`);

  if (status === "loading") {
    return (
      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="mt-4 h-16 w-full" />
          </Card>
        ))}
      </div>
    );
  }
  if (status === "error") {
    return <EmptyState icon={CalendarDays} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }
  if (data.fixtures.length === 0) {
    return <EmptyState icon={CalendarDays} message="No recent or upcoming fixtures are available for this team." />;
  }

  return (
    <div className="space-y-6">
      {(["upcoming", "recent"] as const).map((bucket) => {
        const fixtures = data.fixtures.filter((fixture) => fixture.bucket === bucket);
        if (fixtures.length === 0) return null;
        return (
          <section key={bucket}>
            <h2 className="mb-3 font-display text-2xl font-semibold capitalize">{bucket}</h2>
            <div className="grid gap-4 xl:grid-cols-3">
              {fixtures.map((fixture) => (
                <MatchCard
                  key={fixture.id}
                  match={{
                    id: fixture.id,
                    competition: fixture.competition.name,
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
        );
      })}
    </div>
  );
}

function FormTab({ teamId }: { teamId: string }) {
  const { data, error, refetch, status } = useApiResource<TeamFormPayload>(`/api/teams/${teamId}/form`);

  if (status === "loading") {
    return (
      <Card>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-4 h-64 w-full" />
      </Card>
    );
  }
  if (status === "error") {
    return <EmptyState icon={TrendingUp} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }
  if (data.results.length === 0) {
    return <EmptyState icon={TrendingUp} message="No finished matches are available to calculate form." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Last 10</h2>
          <FormGuide results={data.results} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.trend}>
              <XAxis dataKey="label" stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} width={28} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-hairline)",
                  borderRadius: 6,
                  color: "var(--color-text-primary)",
                }}
              />
              <Line type="monotone" dataKey="goalsFor" stroke="var(--color-turf)" strokeWidth={2} dot={false} name="Goals for" />
              <Line type="monotone" dataKey="goalsAgainst" stroke="var(--color-dusk)" strokeWidth={2} dot={false} name="Goals against" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export function TeamDetailClient({ teamId }: { teamId: string }) {
  const { data, error, refetch, status } = useApiResource<TeamDetailPayload>(`/api/teams/${teamId}`);

  if (status === "loading") {
    return (
      <div>
        <Skeleton className="h-20 w-full" />
        <div className="mt-6">
          <CardListSkeleton />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return <EmptyState icon={Users} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }

  const { team } = data;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Crest src={team.crestUrl} alt={`${team.name} crest`} size={72} />
          <div className="min-w-0">
            <PageHeader eyebrow="Team" title={team.name} />
            <div className="flex flex-wrap gap-2">
              {team.competitions.map((competition) => (
                <Badge key={competition.id}>{competition.code ?? competition.name}</Badge>
              ))}
              <Badge variant="info">{team.country ?? "Unknown country"}</Badge>
            </div>
            {team.clubColors && <p className="mt-2 text-sm text-secondary">{team.clubColors}</p>}
          </div>
        </div>
        <Button variant="ghost" aria-label="Favorite team" onClick={() => undefined}>
          <Star size={20} strokeWidth={1.75} />
        </Button>
      </div>
      <Tabs
        tabs={[
          { id: "squad", label: "Squad", content: <SquadTab teamId={teamId} /> },
          { id: "fixtures", label: "Fixtures", content: <FixturesTab teamId={teamId} /> },
          { id: "form", label: "Form", content: <FormTab teamId={teamId} /> },
        ]}
      />
      <div className="mt-6">
        <Button variant="secondary" onClick={refetch}>
          Refresh team
        </Button>
      </div>
    </div>
  );
}
