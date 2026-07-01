import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { competitions } from "@/components/mock/data";
import { FeedbackStates, PageHeader } from "@/components/mock/page-sections";

export default function CompetitionsPage() {
  return (
    <div>
      <PageHeader eyebrow="Browse" title="Competitions" />
      <div className="mb-5 flex flex-wrap gap-2">
        {["All", "Domestic", "Cups", "Continental", "International"].map((filter) => (
          <Badge key={filter} variant={filter === "All" ? "info" : "neutral"}>
            {filter}
          </Badge>
        ))}
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {competitions.map((competition) => (
          <Card key={competition.code}>
            <div className="flex h-12 w-12 items-center justify-center rounded bg-surface-raised font-display text-xl font-bold text-floodlight">
              {competition.code}
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold">{competition.name}</h2>
            <p className="text-sm text-secondary">{competition.country}</p>
            <Badge className="mt-4">{competition.type}</Badge>
          </Card>
        ))}
      </section>
      <div className="mt-6">
        <EmptyState icon={Trophy} message="All 12 free-tier competitions will appear here after ingestion." />
      </div>
      <FeedbackStates emptyMessage="No competitions have been added to the mock list." />
    </div>
  );
}
