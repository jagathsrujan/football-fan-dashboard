import { cacheGet, cacheKeys, cacheSet } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export type SearchIndexEntry = {
  type: "competition" | "team" | "player";
  id: string;
  name: string;
  context: string;
  imageUrl: string | null;
  route: string;
};

export type SearchResults = {
  competitions: SearchIndexEntry[];
  teams: SearchIndexEntry[];
  players: SearchIndexEntry[];
};

const TTL = 3600;
const MAX_PER_GROUP = 5;

/**
 * Build the search index from Prisma and write to Upstash cache.
 * Called at the end of each ingestion sync run.
 */
export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  const key = cacheKeys.searchIndex();

  const [competitions, teams, players] = await Promise.all([
    prisma.competition.findMany({
      select: { id: true, name: true, code: true, type: true, emblemUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.team.findMany({
      select: { id: true, name: true, country: true, crestUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.player.findMany({
      select: {
        id: true,
        name: true,
        position: true,
        currentTeam: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const entries: SearchIndexEntry[] = [
    ...competitions.map((c) => ({
      type: "competition" as const,
      id: c.id,
      name: c.name,
      context: formatCompetitionType(c.type),
      imageUrl: c.emblemUrl,
      route: `/competitions/${c.code ?? c.id}`,
    })),
    ...teams.map((t) => ({
      type: "team" as const,
      id: t.id,
      name: t.name,
      context: t.country ?? "",
      imageUrl: t.crestUrl,
      route: `/teams/${t.id}`,
    })),
    ...players.map((p) => ({
      type: "player" as const,
      id: p.id,
      name: p.name,
      context: [p.position, p.currentTeam?.name].filter(Boolean).join(" · "),
      imageUrl: null,
      route: `/players/${p.id}`,
    })),
  ];

  await cacheSet(key, entries, TTL);
  return entries;
}

/**
 * Cache-aside: read the search index from Upstash, falling back to a fresh build.
 */
async function getSearchIndex(): Promise<SearchIndexEntry[]> {
  const key = cacheKeys.searchIndex();
  const cached = await cacheGet<SearchIndexEntry[]>(key);
  if (cached) return cached;
  return buildSearchIndex();
}

/**
 * Filter the cached search index in-memory. No Postgres per keystroke.
 */
export async function searchIndex(query: string): Promise<SearchResults> {
  const entries = await getSearchIndex();
  const q = query.toLowerCase().trim();

  if (!q) {
    return { competitions: [], teams: [], players: [] };
  }

  const competitions: SearchIndexEntry[] = [];
  const teams: SearchIndexEntry[] = [];
  const players: SearchIndexEntry[] = [];

  for (const entry of entries) {
    if (
      entry.name.toLowerCase().includes(q) ||
      entry.context.toLowerCase().includes(q)
    ) {
      const group =
        entry.type === "competition"
          ? competitions
          : entry.type === "team"
            ? teams
            : players;

      if (group.length < MAX_PER_GROUP) {
        group.push(entry);
      }
    }

    // Early exit once all groups are full
    if (
      competitions.length >= MAX_PER_GROUP &&
      teams.length >= MAX_PER_GROUP &&
      players.length >= MAX_PER_GROUP
    ) {
      break;
    }
  }

  return { competitions, teams, players };
}

function formatCompetitionType(type: string): string {
  switch (type) {
    case "LEAGUE":
      return "League";
    case "CUP":
      return "Cup";
    case "CONTINENTAL":
      return "Continental";
    case "INTERNATIONAL":
      return "International";
    default:
      return type;
  }
}
