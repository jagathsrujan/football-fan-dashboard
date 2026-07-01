import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { notFound } from "@/lib/queries/errors";
import { prisma } from "@/lib/prisma";

export type CompetitionListItem = {
  id: string;
  name: string;
  code: string | null;
  type: string;
  tier: number | null;
  emblemUrl: string | null;
  country: string | null;
};

export type CompetitionDetail = CompetitionListItem & {
  currentSeason: {
    id: string;
    yearLabel: string;
    startDate: string;
    endDate: string;
  } | null;
};

const TTL = 3600;

export async function getCompetitions() {
  const key = cacheKeys.competitions();
  const cached = await cacheGet<CompetitionListItem[]>(key);
  if (cached) return cached;

  const competitions = await prisma.competition.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: { federation: true },
  });

  const payload = competitions.map((competition) => ({
    id: competition.id,
    name: competition.name,
    code: competition.code,
    type: competition.type,
    tier: competition.tier,
    emblemUrl: competition.emblemUrl,
    country: competition.federation?.country ?? null,
  }));

  await cacheSet(key, payload, TTL);
  return payload;
}

export async function getCompetitionByCode(code: string) {
  const normalizedCode = code.toUpperCase();
  const key = cacheKeys.competition(normalizedCode);
  const cached = await cacheGet<CompetitionDetail>(key);
  if (cached) return cached;

  const competition = await prisma.competition.findUnique({
    where: { code: normalizedCode },
    include: {
      federation: true,
      seasons: {
        where: { isCurrent: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!competition) notFound("Competition not found");

  const season = competition.seasons[0] ?? null;
  const payload: CompetitionDetail = {
    id: competition.id,
    name: competition.name,
    code: competition.code,
    type: competition.type,
    tier: competition.tier,
    emblemUrl: competition.emblemUrl,
    country: competition.federation?.country ?? null,
    currentSeason: season
      ? {
          id: season.id,
          yearLabel: season.yearLabel,
          startDate: season.startDate.toISOString(),
          endDate: season.endDate.toISOString(),
        }
      : null,
  };

  await cacheSet(key, payload, TTL);
  return payload;
}
