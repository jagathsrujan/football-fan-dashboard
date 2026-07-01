import { Star } from "lucide-react";
import { TeamCard } from "@/components/football/team-card";
import { teams } from "@/components/mock/data";
import { FeedbackStates, PageHeader } from "@/components/mock/page-sections";
import { EmptyState } from "@/components/ui/empty-state";

export default function FavoritesPage() {
  return (
    <div>
      <PageHeader eyebrow="Personal" title="Favorites" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.slice(0, 2).map((team) => (
          <TeamCard key={team.id} name={team.name} competition={team.competition} form={team.form} />
        ))}
      </section>
      <div className="mt-6">
        <EmptyState icon={Star} message="Sign in during Phase 4 to save favorite teams and players." />
      </div>
      <FeedbackStates emptyMessage="You have not favorited any mock teams yet." />
    </div>
  );
}
