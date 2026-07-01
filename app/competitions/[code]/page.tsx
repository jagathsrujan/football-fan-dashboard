import { CalendarDays, Goal } from "lucide-react";
import { MatchCard } from "@/components/football/match-card";
import { PlayerAvatar } from "@/components/football/player-avatar";
import { StandingsTable } from "@/components/football/standings-table";
import { matches, players, standings, teamAccent } from "@/components/mock/data";
import { FeedbackStates, PageHeader, SkeletonTable } from "@/components/mock/page-sections";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";

export default function CompetitionDetailPage() {
  return (
    <div>
      <PageHeader eyebrow="Competition" title="Premier League" />
      <Tabs
        tabs={[
          {
            id: "table",
            label: "Table",
            content: <StandingsTable standings={standings} zones={{ promotion: [1, 2], relegation: [18] }} />,
          },
          {
            id: "scorers",
            label: "Scorers",
            content: (
              <div className="grid gap-3">
                {players.slice(0, 3).map((player, index) => (
                  <Card key={player.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={player.name} teamAccent={teamAccent} />
                      <div>
                        <h2 className="font-semibold">{player.name}</h2>
                        <p className="text-sm text-secondary">{player.team}</p>
                      </div>
                    </div>
                    <Badge variant="info">{12 - index * 2} goals</Badge>
                  </Card>
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
        ]}
      />
      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 font-display text-xl font-semibold">Loading</h2>
          <SkeletonTable />
        </Card>
        <EmptyState icon={CalendarDays} message="No fixtures are available for this competition." />
        <EmptyState icon={Goal} message="Unable to load competition data. Retry from the tab controls." variant="error" />
      </section>
      <FeedbackStates emptyMessage="No standings rows exist for this mock season." />
    </div>
  );
}
