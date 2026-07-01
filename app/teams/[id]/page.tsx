import { CalendarDays, Users } from "lucide-react";
import { MatchCard } from "@/components/football/match-card";
import { PlayerCard } from "@/components/football/player-card";
import { StatRow } from "@/components/football/stat-row";
import { matches, players } from "@/components/mock/data";
import { FeedbackStates, PageHeader } from "@/components/mock/page-sections";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";

export default function TeamDetailPage() {
  return (
    <div>
      <PageHeader eyebrow="Team" title="Manchester City" />
      <Tabs
        tabs={[
          {
            id: "squad",
            label: "Squad",
            content: (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {players.map((player) => (
                  <PlayerCard key={player.id} name={player.name} position={player.position} team={player.team} />
                ))}
              </div>
            ),
          },
          {
            id: "fixtures",
            label: "Fixtures",
            content: (
              <div className="grid gap-4 xl:grid-cols-3">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ),
          },
          {
            id: "form",
            label: "Form",
            content: (
              <Card>
                {[
                  ["Last 10", "7W 2D 1L"],
                  ["Goals for", 24],
                  ["Goals against", 8],
                ].map(([label, value]) => (
                  <StatRow key={label} label={String(label)} value={value} />
                ))}
              </Card>
            ),
          },
        ]}
      />
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <EmptyState icon={Users} message="No squad players have been synced for this team." />
        <EmptyState icon={CalendarDays} message="Team data could not be loaded. Retry from the route." variant="error" />
      </section>
      <FeedbackStates emptyMessage="No team fixtures match the selected mock filter." />
    </div>
  );
}
