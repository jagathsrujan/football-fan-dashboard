const BASE_URL = "https://api.football-data.org/v4";
const MIN_DELAY_MS = 6_000;

type RequestOptions = {
  retryOnRateLimit?: boolean;
};

let queue = Promise.resolve();
let lastRequestAt = 0;

async function waitForTurn() {
  const now = Date.now();
  const waitMs = Math.max(0, MIN_DELAY_MS - (now - lastRequestAt));
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastRequestAt = Date.now();
}

async function enqueue<T>(task: () => Promise<T>) {
  const run = queue.then(async () => {
    await waitForTurn();
    return task();
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export class FootballDataError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly resource: string,
  ) {
    super(message);
  }
}

export class FootballDataClient {
  constructor(private readonly apiKey = process.env.FOOTBALL_DATA_API_KEY) {}

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (!this.apiKey) {
      throw new FootballDataError("FOOTBALL_DATA_API_KEY is not configured", 500, path);
    }

    return enqueue(() => this.fetchJson<T>(path, options.retryOnRateLimit ?? true));
  }

  private async fetchJson<T>(path: string, retryOnRateLimit: boolean): Promise<T> {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": this.apiKey ?? "",
      },
      next: { revalidate: 0 },
    });

    if (response.status === 429 && retryOnRateLimit) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1_000 : MIN_DELAY_MS;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return this.fetchJson<T>(path, false);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new FootballDataError(
        `football-data.org request failed (${response.status})${body ? `: ${body}` : ""}`,
        response.status,
        path,
      );
    }

    return response.json() as Promise<T>;
  }

  competitions() {
    return this.get<FootballDataCompetitionsResponse>("/competitions");
  }

  teams(competitionCode: string) {
    return this.get<FootballDataTeamsResponse>(`/competitions/${encodeURIComponent(competitionCode)}/teams`);
  }

  standings(competitionCode: string) {
    return this.get<FootballDataStandingsResponse>(`/competitions/${encodeURIComponent(competitionCode)}/standings`);
  }

  matches(competitionCode: string) {
    return this.get<FootballDataMatchesResponse>(`/competitions/${encodeURIComponent(competitionCode)}/matches`);
  }
}

export type FootballDataArea = {
  id?: number;
  name?: string;
  code?: string;
};

export type FootballDataSeason = {
  id?: number;
  startDate?: string;
  endDate?: string;
  currentMatchday?: number | null;
};

export type FootballDataCompetition = {
  id: number;
  area?: FootballDataArea;
  name: string;
  code?: string | null;
  type?: string | null;
  emblem?: string | null;
  currentSeason?: FootballDataSeason | null;
};

export type FootballDataTeam = {
  id: number;
  area?: FootballDataArea;
  name: string;
  shortName?: string | null;
  tla?: string | null;
  crest?: string | null;
  clubColors?: string | null;
  squad?: FootballDataPlayer[];
};

export type FootballDataPlayer = {
  id: number;
  name: string;
  dateOfBirth?: string | null;
  nationality?: string | null;
  position?: string | null;
};

export type FootballDataMatch = {
  id: number;
  area?: FootballDataArea;
  competition?: Pick<FootballDataCompetition, "id" | "name" | "code" | "type" | "emblem">;
  season?: FootballDataSeason;
  utcDate: string;
  status: string;
  matchday?: number | null;
  venue?: string | null;
  homeTeam: FootballDataTeam;
  awayTeam: FootballDataTeam;
  score?: {
    fullTime?: { home?: number | null; away?: number | null };
  };
};

export type FootballDataStandingRow = {
  position: number;
  team: FootballDataTeam;
  playedGames?: number;
  won?: number;
  draw?: number;
  lost?: number;
  points?: number;
  goalsFor?: number;
  goalsAgainst?: number;
};

export type FootballDataCompetitionsResponse = {
  competitions: FootballDataCompetition[];
};

export type FootballDataTeamsResponse = {
  teams: FootballDataTeam[];
  season?: FootballDataSeason;
};

export type FootballDataStandingsResponse = {
  competition: FootballDataCompetition;
  season: FootballDataSeason;
  standings: Array<{ table: FootballDataStandingRow[] }>;
};

export type FootballDataMatchesResponse = {
  matches: FootballDataMatch[];
};
