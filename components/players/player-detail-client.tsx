"use client";

import { Flag, Shield, User } from "lucide-react";
import { Crest } from "@/components/football/crest";
import { PlayerAvatar } from "@/components/football/player-avatar";
import { useApiResource } from "@/components/competitions/use-api-resource";
import { PageHeader } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import type { PlayerDetailPayload } from "@/lib/queries/get-player";
import type { PlayerStatsPayload } from "@/lib/queries/get-player-stats";

const fallbackAccent = "var(--color-turf)";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wider text-secondary">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold">{value}</p>
    </Card>
  );
}

function StatGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-16" />
        </Card>
      ))}
    </div>
  );
}

function ClubStatsTab({ playerId }: { playerId: string }) {
  const { data, error, refetch, status } = useApiResource<PlayerStatsPayload>(`/api/players/${playerId}/stats`);

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <StatGridSkeleton />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }
  if (status === "error") {
    return <EmptyState icon={Shield} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }
  if (data.clubStats.length === 0) {
    return <EmptyState icon={Shield} message="No club statistics have been synced for this player." />;
  }

  const totals = data.clubStats.reduce(
    (acc, row) => ({
      appearances: acc.appearances + row.appearances,
      goals: acc.goals + row.goals,
      assists: acc.assists + row.assists,
      cards: acc.cards + row.yellowCards + row.redCards,
    }),
    { appearances: 0, goals: 0, assists: 0, cards: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Appearances" value={totals.appearances} />
        <StatCard label="Goals" value={totals.goals} />
        <StatCard label="Assists" value={totals.assists} />
        <StatCard label="Cards" value={totals.cards} />
      </div>
      <div className="overflow-x-auto rounded-md border border-hairline bg-surface">
        <Table className="min-w-standings">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Season</TableHeaderCell>
              <TableHeaderCell>Team</TableHeaderCell>
              <TableHeaderCell>Apps</TableHeaderCell>
              <TableHeaderCell>G</TableHeaderCell>
              <TableHeaderCell>A</TableHeaderCell>
              <TableHeaderCell>YC</TableHeaderCell>
              <TableHeaderCell>RC</TableHeaderCell>
              <TableHeaderCell>Min</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.clubStats.map((row) => (
              <TableRow key={`${row.season}-${row.team}`}>
                <TableCell className="font-data text-sm tabular-nums">{row.season}</TableCell>
                <TableCell>{row.team}</TableCell>
                <TableCell className="font-data text-sm tabular-nums">{row.appearances}</TableCell>
                <TableCell className="font-data text-sm tabular-nums">{row.goals}</TableCell>
                <TableCell className="font-data text-sm tabular-nums">{row.assists}</TableCell>
                <TableCell className="font-data text-sm tabular-nums">{row.yellowCards}</TableCell>
                <TableCell className="font-data text-sm tabular-nums">{row.redCards}</TableCell>
                <TableCell className="font-data text-sm tabular-nums">{row.minutes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function InternationalStatsTab({ playerId }: { playerId: string }) {
  const { data, error, refetch, status } = useApiResource<PlayerStatsPayload>(`/api/players/${playerId}/stats`);

  if (status === "loading") return <StatGridSkeleton />;
  if (status === "error") {
    return <EmptyState icon={Flag} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }
  if (!data.internationalStats) {
    return <EmptyState icon={Flag} message="No international statistics have been synced for this player." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">Separate from club statistics.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Federation" value={data.internationalStats.federation} />
        <StatCard label="Caps" value={data.internationalStats.caps} />
        <StatCard label="Goals" value={data.internationalStats.goals} />
      </div>
      <div className="overflow-x-auto rounded-md border border-hairline bg-surface">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Federation</TableHeaderCell>
              <TableHeaderCell>Caps</TableHeaderCell>
              <TableHeaderCell>Goals</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{data.internationalStats.federation}</TableCell>
              <TableCell className="font-data text-sm tabular-nums">{data.internationalStats.caps}</TableCell>
              <TableCell className="font-data text-sm tabular-nums">{data.internationalStats.goals}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function PlayerDetailClient({ playerId }: { playerId: string }) {
  const { data, error, refetch, status } = useApiResource<PlayerDetailPayload>(`/api/players/${playerId}`);

  if (status === "loading") {
    return (
      <div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="mt-3 h-6 w-1/3" />
          </div>
        </div>
        <div className="mt-6">
          <StatGridSkeleton />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return <EmptyState icon={User} message={error} variant="error" action={{ label: "Retry", onClick: refetch }} />;
  }

  const { player } = data;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <PlayerAvatar name={player.name} teamAccent={fallbackAccent} size={96} />
          <div className="min-w-0">
            <PageHeader eyebrow="Player" title={player.name} />
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{player.position ?? "POS"}</Badge>
              {player.currentTeam && (
                <span className="inline-flex items-center gap-2 rounded bg-surface-raised px-2 py-1 text-sm text-secondary">
                  <Crest src={player.currentTeam.crestUrl} alt={`${player.currentTeam.name} crest`} size={20} />
                  {player.currentTeam.name}
                </span>
              )}
              <Badge variant="info">
                <Flag size={14} strokeWidth={1.75} />
                {player.nationality ?? "Unknown"}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="secondary" onClick={refetch}>
          Refresh player
        </Button>
      </div>
      <Tabs
        tabs={[
          { id: "club", label: "Club stats", content: <ClubStatsTab playerId={playerId} /> },
          { id: "international", label: "International stats", content: <InternationalStatsTab playerId={playerId} /> },
        ]}
      />
    </div>
  );
}
