"use client";

import { Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { CompetitionCard } from "@/components/competitions/competition-card";
import { useApiResource } from "@/components/competitions/use-api-resource";
import { FeedbackStates, PageHeader } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompetitionListItem } from "@/lib/queries/get-competitions";

type CompetitionsResponse = {
  competitions: CompetitionListItem[];
};

const filters = [
  { label: "All", value: "ALL" },
  { label: "Leagues", value: "LEAGUE" },
  { label: "Cups", value: "CUP" },
  { label: "Continental", value: "CONTINENTAL" },
  { label: "International", value: "INTERNATIONAL" },
];

function CompetitionGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="rounded-md border border-hairline bg-surface p-4">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="mt-4 h-8 w-2/3" />
          <Skeleton className="mt-2 h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function CompetitionListClient() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const { data, error, refetch, status } = useApiResource<CompetitionsResponse>("/api/competitions");

  const competitions = useMemo(() => {
    const rows = data?.competitions ?? [];
    if (activeFilter === "ALL") return rows;
    return rows.filter((competition) => competition.type === activeFilter);
  }, [activeFilter, data]);

  return (
    <div>
      <PageHeader eyebrow="Browse" title="Competitions" />
      <div className="mb-5 flex flex-wrap gap-2" role="list" aria-label="Competition filters">
        {filters.map((filter) => (
          <button key={filter.value} onClick={() => setActiveFilter(filter.value)} type="button">
            <Badge variant={activeFilter === filter.value ? "info" : "neutral"}>{filter.label}</Badge>
          </button>
        ))}
      </div>

      {status === "loading" && <CompetitionGridSkeleton />}
      {status === "error" && (
        <EmptyState
          icon={Trophy}
          message={error}
          variant="error"
          action={{ label: "Retry", onClick: refetch }}
        />
      )}
      {status === "success" && competitions.length === 0 && (
        <EmptyState icon={Trophy} message="No competitions match this filter." />
      )}
      {status === "success" && competitions.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {competitions.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </section>
      )}

      <div className="mt-6">
        <Button variant="secondary" onClick={refetch} loading={status === "loading"}>
          Refresh competitions
        </Button>
      </div>
      <FeedbackStates emptyMessage="No competitions have been ingested yet." />
    </div>
  );
}
