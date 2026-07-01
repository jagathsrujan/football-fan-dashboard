import { Flag, User } from "lucide-react";
import { PlayerAvatar } from "@/components/football/player-avatar";
import { StatRow } from "@/components/football/stat-row";
import { teamAccent } from "@/components/mock/data";
import { FeedbackStates, PageHeader, StatGrid } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";

export default function PlayerDetailPage() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <PlayerAvatar name="Erling Haaland" teamAccent={teamAccent} size={80} />
        <div>
          <PageHeader eyebrow="Player" title="Erling Haaland" />
          <Badge>FWD</Badge>
        </div>
      </div>
      <StatGrid />
      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: "club",
              label: "Club stats",
              content: (
                <Card>
                  <StatRow label="Appearances" value={18} />
                  <StatRow label="Goals" value={16} />
                  <StatRow label="Assists" value={4} />
                  <StatRow label="Minutes" value={1520} />
                </Card>
              ),
            },
            {
              id: "international",
              label: "International stats",
              content: (
                <Card>
                  <StatRow label="Federation" value="Norway" />
                  <StatRow label="Caps" value={34} />
                  <StatRow label="Goals" value={31} />
                </Card>
              ),
            },
          ]}
        />
      </div>
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <EmptyState icon={User} message="No player stats are available for this mock season." />
        <EmptyState icon={Flag} message="International stats could not be loaded." variant="error" />
      </section>
      <FeedbackStates emptyMessage="No player records match this mock player id." />
    </div>
  );
}
