import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crest } from "@/components/football/crest";
import { FormGuide } from "@/components/football/form-guide";

export function TeamCard({
  competition,
  form,
  name,
}: {
  competition: string;
  form: readonly ("W" | "D" | "L")[];
  name: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Crest src={null} alt={`${name} crest`} size={40} />
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl font-semibold">{name}</h3>
            <Badge>{competition}</Badge>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <FormGuide results={form} />
      </div>
    </Card>
  );
}
