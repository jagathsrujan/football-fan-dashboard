import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/football/player-avatar";
import { teamAccent } from "@/components/mock/data";

export function PlayerCard({ name, position, team }: { name: string; position: string; team: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <PlayerAvatar name={name} teamAccent={teamAccent} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge>{position}</Badge>
            <span className="truncate text-sm text-secondary">{team}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
