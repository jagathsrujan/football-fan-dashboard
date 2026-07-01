import { MatchCard } from "@/components/football/match-card";
import { TeamCard } from "@/components/football/team-card";
import { matches, teams } from "@/components/mock/data";
import { FeedbackStates, PageHeader, StatGrid } from "@/components/mock/page-sections";

export default function Home() {
  return (
    <div>
      <PageHeader eyebrow="Today" title="Football Fan Dashboard" />
      <StatGrid />
      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <TeamCard key={team.id} name={team.name} competition={team.competition} form={team.form} />
        ))}
      </section>
      <FeedbackStates emptyMessage="No matches are scheduled for this mock matchday." />
    </div>
  );
}
