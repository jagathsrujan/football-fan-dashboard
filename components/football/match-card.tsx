import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crest } from "@/components/football/crest";
import { LiveBadge } from "@/components/football/live-badge";
import { ScoreDisplay } from "@/components/football/score-display";
import type { MatchStatus } from "@/components/football/types";

type MatchCardProps = {
  match: {
    id: string;
    competition: string;
    kickoffTime: string;
    status: MatchStatus;
    homeTeam: { name: string; crestUrl: string | null };
    awayTeam: { name: string; crestUrl: string | null };
    homeScore: number | null;
    awayScore: number | null;
  };
};

function StatusBadge({ status, kickoffTime }: { status: MatchStatus; kickoffTime: string }) {
  if (status === "IN_PLAY") return <LiveBadge />;
  if (status === "FINISHED") return <Badge>FT</Badge>;
  return <Badge>{kickoffTime}</Badge>;
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm text-secondary">
          <CalendarDays size={18} strokeWidth={1.75} />
          <span className="truncate">{match.competition}</span>
        </div>
        <StatusBadge kickoffTime={match.kickoffTime} status={match.status} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Crest src={match.homeTeam.crestUrl} alt={`${match.homeTeam.name} crest`} />
            <span className="truncate font-semibold">{match.homeTeam.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Crest src={match.awayTeam.crestUrl} alt={`${match.awayTeam.name} crest`} />
            <span className="truncate font-semibold">{match.awayTeam.name}</span>
          </div>
        </div>
        <ScoreDisplay homeScore={match.homeScore} awayScore={match.awayScore} status={match.status} />
      </div>
    </Card>
  );
}
