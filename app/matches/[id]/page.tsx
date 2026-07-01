import { ListX } from "lucide-react";
import { Crest } from "@/components/football/crest";
import { LiveBadge } from "@/components/football/live-badge";
import { ScoreDisplay } from "@/components/football/score-display";
import { FeedbackStates, PageHeader } from "@/components/mock/page-sections";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";

export default function MatchDetailPage() {
  return (
    <div>
      <PageHeader eyebrow="Premier League · Matchday 20" title="Manchester City vs Arsenal" />
      <Card className="text-center">
        <div className="mb-4 flex items-center justify-center gap-4">
          <Crest src={null} alt="Manchester City crest" size={56} />
          <ScoreDisplay homeScore={2} awayScore={1} status="IN_PLAY" />
          <Crest src={null} alt="Arsenal crest" size={56} />
        </div>
        <LiveBadge />
      </Card>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl font-semibold">Events</h2>
          {["12' Goal · Manchester City", "38' Yellow card · Arsenal", "66' Goal · Manchester City"].map((event) => (
            <p key={event} className="border-b border-hairline py-3 text-sm text-secondary last:border-b-0">
              {event}
            </p>
          ))}
        </Card>
        <EmptyState icon={ListX} message="Lineups are not available on the free football-data.org tier." />
      </section>
      <FeedbackStates emptyMessage="No match events have been synced for this mock match." />
    </div>
  );
}
