import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Crest } from "@/components/football/crest";
import type { CompetitionListItem } from "@/lib/queries/get-competitions";

function typeLabel(type: string) {
  if (type === "LEAGUE") return "League";
  if (type === "CUP") return "Cup";
  if (type === "CONTINENTAL") return "Continental";
  return "International";
}

export function CompetitionCard({ competition }: { competition: CompetitionListItem }) {
  const href = competition.code ? `/competitions/${competition.code}` : "/competitions";

  return (
    <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40">
      <Card className="h-full">
        <div className="flex items-start justify-between gap-3">
          <Crest src={competition.emblemUrl} alt={`${competition.name} emblem`} size={48} />
          <Badge>{competition.code ?? "TBD"}</Badge>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">{competition.name}</h2>
        <p className="text-sm text-secondary">{competition.country ?? "Global"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={competition.type === "CONTINENTAL" ? "info" : "neutral"}>{typeLabel(competition.type)}</Badge>
          {competition.tier && <Badge>Tier {competition.tier}</Badge>}
        </div>
      </Card>
    </Link>
  );
}
