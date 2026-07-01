import { cacheDel, cacheKeys } from "@/lib/cache";
import {
  FootballDataClient,
  type FootballDataCompetition,
  type FootballDataSeason,
  type FootballDataTeam,
} from "@/lib/football-data-client";
import { mapCompetition, mapSeason } from "@/lib/ingestion/map-competition";
import { mapMatch } from "@/lib/ingestion/map-match";
import { mapPlayer, mapTeam } from "@/lib/ingestion/map-team";
import { prisma } from "@/lib/prisma";
import { buildSearchIndex } from "@/lib/queries/search";

type SyncContext = {
  client: FootballDataClient;
  failedResources: string[];
  touchedCacheKeys: Set<string>;
  competitionsUpdated: number;
  matchesUpdated: number;
};

export type SyncSummary = {
  ok: boolean;
  partial?: boolean;
  failedResources: string[];
  touchedCacheKeys: string[];
  competitionsUpdated: number;
  matchesUpdated: number;
  durationMs: number;
};

const CONFEDERATIONS = [
  ["UEFA", "Union of European Football Associations"],
  ["CONMEBOL", "South American Football Confederation"],
  ["CONCACAF", "Confederation of North, Central America and Caribbean Association Football"],
  ["CAF", "Confederation of African Football"],
  ["AFC", "Asian Football Confederation"],
  ["OFC", "Oceania Football Confederation"],
] as const;

function federationId(area?: { id?: number; code?: string; name?: string }) {
  const stable = area?.id ?? area?.code ?? area?.name ?? "unknown";
  return `football-data-area-${stable}`;
}

function federationName(area?: { name?: string }) {
  return area?.name ? `${area.name} Federation` : "Unknown Federation";
}

function inferConfederationCode(areaName?: string) {
  if (areaName === "Europe") return "UEFA";
  if (areaName === "South America") return "CONMEBOL";
  if (areaName === "North America" || areaName === "Central America") return "CONCACAF";
  if (areaName === "Africa") return "CAF";
  if (areaName === "Asia") return "AFC";
  if (areaName === "Oceania") return "OFC";
  return null;
}

function inferTeamType(competition: FootballDataCompetition, team: FootballDataTeam): "CLUB" | "NATIONAL" {
  if (competition.type === "INTERNATIONAL") return "NATIONAL";
  if (team.name.toLowerCase().includes("national")) return "NATIONAL";
  return "CLUB";
}

async function syncConfederations() {
  console.log("[sync] confederations");
  for (const [code, name] of CONFEDERATIONS) {
    await prisma.confederation.upsert({
      where: { code },
      create: { code, name },
      update: { name },
    });
  }
}

async function upsertFederation(area?: { id?: number; code?: string; name?: string }) {
  if (!area?.name) return null;
  const confederationCode = inferConfederationCode(area.name);
  const confederation = confederationCode
    ? await prisma.confederation.findUnique({ where: { code: confederationCode } })
    : null;

  return prisma.federation.upsert({
    where: { id: federationId(area) },
    create: {
      id: federationId(area),
      name: federationName(area),
      country: area.name,
      confederationId: confederation?.id ?? null,
    },
    update: {
      name: federationName(area),
      country: area.name,
      confederationId: confederation?.id ?? null,
    },
  });
}

async function upsertCurrentSeason(competitionId: string, competition: FootballDataCompetition, season?: FootballDataSeason | null) {
  const competitionWithSeason = {
    ...competition,
    currentSeason: season ?? competition.currentSeason,
  };
  const seasonInput = mapSeason(competitionId, competitionWithSeason);
  await prisma.season.updateMany({
    where: { competitionId, isCurrent: true, yearLabel: { not: seasonInput.yearLabel } },
    data: { isCurrent: false },
  });
  return prisma.season.upsert({
    where: {
      competitionId_yearLabel: {
        competitionId,
        yearLabel: seasonInput.yearLabel,
      },
    },
    create: seasonInput,
    update: {
      startDate: seasonInput.startDate,
      endDate: seasonInput.endDate,
      isCurrent: true,
    },
  });
}

async function upsertTeam(team: FootballDataTeam, competition: FootballDataCompetition, federationIdValue?: string | null) {
  const input = mapTeam(team, federationIdValue, inferTeamType(competition, team));
  return prisma.team.upsert({
    where: { footballDataId: team.id },
    create: input,
    update: {
      name: input.name,
      shortName: input.shortName,
      type: input.type,
      country: input.country,
      federationId: input.federationId,
      crestUrl: input.crestUrl,
      clubColors: input.clubColors,
    },
  });
}

async function syncSquad(team: FootballDataTeam, teamId: string, seasonId: string) {
  for (const player of team.squad ?? []) {
    const input = mapPlayer(player, teamId);
    const savedPlayer = await prisma.player.upsert({
      where: { footballDataId: player.id },
      create: input,
      update: {
        name: input.name,
        dob: input.dob,
        nationality: input.nationality,
        position: input.position,
        currentTeamId: input.currentTeamId,
      },
    });
    await prisma.squadMembership.upsert({
      where: {
        teamId_playerId_seasonId: {
          teamId,
          playerId: savedPlayer.id,
          seasonId,
        },
      },
      create: {
        teamId,
        playerId: savedPlayer.id,
        seasonId,
      },
      update: {},
    });
  }
}

async function syncCompetition(competition: FootballDataCompetition, context: SyncContext) {
  const code = competition.code;
  if (!code) {
    context.failedResources.push(`competition:${competition.id}:missing-code`);
    return;
  }

  console.log(`[sync] competition ${code}`);
  const federation = await upsertFederation(competition.area);
  const competitionInput = mapCompetition(competition);
  const savedCompetition = await prisma.competition.upsert({
    where: { footballDataId: competition.id },
    create: {
      ...competitionInput,
      federationId: federation?.id ?? null,
    },
    update: {
      name: competitionInput.name,
      code: competitionInput.code,
      type: competitionInput.type,
      emblemUrl: competitionInput.emblemUrl,
      federationId: federation?.id ?? null,
    },
  });
  context.competitionsUpdated += 1;

  const season = await upsertCurrentSeason(savedCompetition.id, competition);

  try {
    console.log(`[sync] teams ${code}`);
    const teamsResponse = await context.client.teams(code);
    const teamSeason = await upsertCurrentSeason(savedCompetition.id, competition, teamsResponse.season);
    for (const team of teamsResponse.teams) {
      const teamFederation = await upsertFederation(team.area ?? competition.area);
      const savedTeam = await upsertTeam(team, competition, teamFederation?.id ?? federation?.id ?? null);
      await syncSquad(team, savedTeam.id, teamSeason.id);
      context.touchedCacheKeys.add(cacheKeys.team(savedTeam.id));
    }
  } catch (error) {
    console.error(`[sync] teams failed for ${code}`, error);
    context.failedResources.push(`teams:${code}`);
  }

  try {
    console.log(`[sync] standings ${code}`);
    const standingsResponse = await context.client.standings(code);
    const standingsSeason = await upsertCurrentSeason(savedCompetition.id, competition, standingsResponse.season);
    const table = standingsResponse.standings.flatMap((standing) => standing.table ?? []);
    for (const row of table) {
      const savedTeam = await upsertTeam(row.team, competition, federation?.id ?? null);
      await prisma.standing.upsert({
        where: {
          competitionId_seasonId_teamId: {
            competitionId: savedCompetition.id,
            seasonId: standingsSeason.id,
            teamId: savedTeam.id,
          },
        },
        create: {
          competitionId: savedCompetition.id,
          seasonId: standingsSeason.id,
          teamId: savedTeam.id,
          played: row.playedGames ?? 0,
          won: row.won ?? 0,
          drawn: row.draw ?? 0,
          lost: row.lost ?? 0,
          goalsFor: row.goalsFor ?? 0,
          goalsAgainst: row.goalsAgainst ?? 0,
          points: row.points ?? 0,
          position: row.position,
        },
        update: {
          played: row.playedGames ?? 0,
          won: row.won ?? 0,
          drawn: row.draw ?? 0,
          lost: row.lost ?? 0,
          goalsFor: row.goalsFor ?? 0,
          goalsAgainst: row.goalsAgainst ?? 0,
          points: row.points ?? 0,
          position: row.position,
        },
      });
    }
    context.touchedCacheKeys.add(cacheKeys.standings(savedCompetition.id, standingsSeason.id));
  } catch (error) {
    console.error(`[sync] standings failed for ${code}`, error);
    context.failedResources.push(`standings:${code}`);
  }

  try {
    console.log(`[sync] fixtures ${code}`);
    const matchesResponse = await context.client.matches(code);
    const knownSeason = season;
    for (const match of matchesResponse.matches) {
      const matchSeason = await upsertCurrentSeason(savedCompetition.id, competition, match.season ?? null);
      const homeTeam = await upsertTeam(match.homeTeam, competition, federation?.id ?? null);
      const awayTeam = await upsertTeam(match.awayTeam, competition, federation?.id ?? null);
      const matchInput = mapMatch(match, savedCompetition.id, matchSeason.id, homeTeam.id, awayTeam.id);
      await prisma.match.upsert({
        where: { footballDataId: match.id },
        create: matchInput,
        update: {
          kickoffTime: matchInput.kickoffTime,
          venue: matchInput.venue,
          matchday: matchInput.matchday,
          status: matchInput.status,
          homeScore: matchInput.homeScore,
          awayScore: matchInput.awayScore,
          homeTeamId: matchInput.homeTeamId,
          awayTeamId: matchInput.awayTeamId,
          seasonId: matchInput.seasonId,
          competitionId: matchInput.competitionId,
        },
      });
      context.matchesUpdated += 1;
    }
    context.touchedCacheKeys.add(cacheKeys.fixtures(savedCompetition.id, knownSeason.id, "current-season"));
  } catch (error) {
    console.error(`[sync] fixtures failed for ${code}`, error);
    context.failedResources.push(`fixtures:${code}`);
  }
}

export async function syncFootballData(client = new FootballDataClient()): Promise<SyncSummary> {
  const startedAt = Date.now();
  const context: SyncContext = {
    client,
    failedResources: [],
    touchedCacheKeys: new Set([cacheKeys.searchIndex()]),
    competitionsUpdated: 0,
    matchesUpdated: 0,
  };

  await syncConfederations();

  try {
    console.log("[sync] competitions");
    const response = await client.competitions();
    for (const competition of response.competitions) {
      try {
        await syncCompetition(competition, context);
      } catch (error) {
        console.error(`[sync] competition failed for ${competition.code ?? competition.id}`, error);
        context.failedResources.push(`competition:${competition.code ?? competition.id}`);
      }
    }
  } catch (error) {
    console.error("[sync] competitions failed", error);
    context.failedResources.push("competitions");
  }

  // Rebuild search index from the fresh data before invalidating stale keys
  try {
    console.log("[sync] rebuilding search index");
    await buildSearchIndex();
  } catch (error) {
    console.error("[sync] search index rebuild failed", error);
    context.failedResources.push("search-index");
  }

  const touchedCacheKeys = Array.from(context.touchedCacheKeys);
  await cacheDel(touchedCacheKeys);

  const partial = context.failedResources.length > 0;
  return {
    ok: !partial,
    partial: partial || undefined,
    failedResources: context.failedResources,
    touchedCacheKeys,
    competitionsUpdated: context.competitionsUpdated,
    matchesUpdated: context.matchesUpdated,
    durationMs: Date.now() - startedAt,
  };
}
