import { CalendarDays } from "lucide-react";
import { MatchCard } from "@/components/football/match-card";
import { matches } from "@/components/mock/data";
import { FeedbackStates, PageHeader } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function SchedulePage() {
  return (
    <div>
      <PageHeader eyebrow="Calendar" title="Schedule" />
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge variant="info">List</Badge>
        <Badge>Week grid</Badge>
        <Badge>Premier League</Badge>
      </div>
      <section className="grid gap-4 xl:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </section>
      <Card className="mt-6">
        <h2 className="mb-4 font-display text-2xl font-semibold">Week grid</h2>
        <div className="grid gap-2 md:grid-cols-7">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="min-h-24 rounded border border-hairline bg-surface-raised p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-secondary">{day}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-6">
        <EmptyState icon={CalendarDays} message="No matches are scheduled for the selected mock week." />
      </div>
      <FeedbackStates emptyMessage="No fixtures match this schedule filter." />
    </div>
  );
}
