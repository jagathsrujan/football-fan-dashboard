import { Prisma } from "@prisma/client";
import type { FootballDataCompetition } from "@/lib/football-data-client";

function competitionType(type?: string | null): Prisma.CompetitionCreateInput["type"] {
  switch (type) {
    case "CUP":
      return "CUP";
    case "LEAGUE":
      return "LEAGUE";
    case "PLAYOFFS":
      return "CUP";
    default:
      return "CONTINENTAL";
  }
}

export function seasonYearLabel(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return String(new Date().getUTCFullYear());
  const start = new Date(startDate).getUTCFullYear();
  const end = new Date(endDate).getUTCFullYear();
  return start === end ? String(start) : `${start}/${String(end).slice(-2)}`;
}

export function mapCompetition(competition: FootballDataCompetition) {
  return {
    footballDataId: competition.id,
    name: competition.name,
    code: competition.code ?? null,
    type: competitionType(competition.type),
    emblemUrl: competition.emblem ?? null,
  } satisfies Prisma.CompetitionUncheckedCreateInput;
}

export function mapSeason(competitionId: string, competition: FootballDataCompetition) {
  const currentSeason = competition.currentSeason;
  const startDate = currentSeason?.startDate ? new Date(currentSeason.startDate) : new Date();
  const endDate = currentSeason?.endDate ? new Date(currentSeason.endDate) : new Date(startDate.getUTCFullYear(), 11, 31);

  return {
    competitionId,
    yearLabel: seasonYearLabel(currentSeason?.startDate, currentSeason?.endDate),
    startDate,
    endDate,
    isCurrent: true,
  } satisfies Prisma.SeasonUncheckedCreateInput;
}
