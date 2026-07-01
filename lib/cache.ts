const DEFAULT_HEADERS = {
  Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN ?? ""}`,
};

function redisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function redisUrl(parts: string[], query?: string) {
  const base = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const path = parts.map((part) => encodeURIComponent(part)).join("/");
  return `${base}/${path}${query ? `?${query}` : ""}`;
}

async function command<T>(parts: string[], query?: string): Promise<T | null> {
  if (!redisConfigured()) return null;
  const response = await fetch(redisUrl(parts, query), { headers: DEFAULT_HEADERS, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Upstash Redis command failed with ${response.status}`);
  }
  const payload = (await response.json()) as { result: T };
  return payload.result;
}

export const cacheKeys = {
  competitions: () => "competitions:v1:all",
  competition: (code: string) => `competition:v1:${code}`,
  standings: (competitionId: string, seasonId: string) => `standings:v1:${competitionId}:${seasonId}`,
  fixtures: (competitionId: string, seasonId: string, date: string) => `fixtures:v1:${competitionId}:${seasonId}:${date}`,
  scorers: (competitionId: string, seasonId: string) => `scorers:v1:${competitionId}:${seasonId}`,
  team: (teamId: string) => `team:v1:${teamId}`,
  squad: (teamId: string, seasonId: string) => `squad:v1:${teamId}:${seasonId}`,
  teamFixtures: (teamId: string) => `team-fixtures:v1:${teamId}`,
  teamForm: (teamId: string) => `team-form:v1:${teamId}`,
  player: (playerId: string) => `player:v1:${playerId}`,
  playerStats: (playerId: string) => `player-stats:v1:${playerId}`,
  match: (matchId: string) => `match:v1:${matchId}`,
  searchIndex: () => "search-index:v1",
};

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await command<string>(["get", key]);
  return value ? (JSON.parse(value) as T) : null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  await command(["set", key, JSON.stringify(value)], `EX=${ttlSeconds}`);
}

export async function cacheDel(keys: string[]) {
  if (keys.length === 0) return;
  await command(["del", ...keys]);
}
