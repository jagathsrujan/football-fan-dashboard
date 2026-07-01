import { Crest } from "@/components/football/crest";
import type { StandingRow } from "@/components/football/types";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type StandingsTableProps = {
  standings: StandingRow[];
  zones: { promotion: number[]; relegation: number[] };
};

export function StandingsTable({ standings, zones }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-hairline bg-surface">
      <Table className="min-w-standings">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="sticky left-0 z-10 w-16 bg-surface">Pos</TableHeaderCell>
            <TableHeaderCell>Team</TableHeaderCell>
            <TableHeaderCell>P</TableHeaderCell>
            <TableHeaderCell>W</TableHeaderCell>
            <TableHeaderCell>D</TableHeaderCell>
            <TableHeaderCell>L</TableHeaderCell>
            <TableHeaderCell>GF</TableHeaderCell>
            <TableHeaderCell>GA</TableHeaderCell>
            <TableHeaderCell>Pts</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((row) => {
            const promotion = zones.promotion.includes(row.position);
            const relegation = zones.relegation.includes(row.position);
            return (
              <TableRow
                key={row.team.id}
                className={cn(
                  promotion && "border-l-2 border-l-win",
                  relegation && "border-l-2 border-l-loss",
                )}
              >
                <TableCell className="sticky left-0 z-10 bg-surface font-display text-2xl font-semibold">
                  {row.position}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Crest src={row.team.crestUrl} alt={`${row.team.name} crest`} />
                    <span className="font-semibold">{row.team.name}</span>
                  </div>
                </TableCell>
                {[row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst, row.points].map((value, index) => (
                  <TableCell key={index} className="font-data text-sm tabular-nums">
                    {value}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
