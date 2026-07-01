import type { MatchStatus } from "@/components/football/types";

export const teamAccent = "#4E9873";

export const competitions = [
  { code: "PL", name: "Premier League", country: "England", type: "Domestic League" },
  { code: "CL", name: "Champions League", country: "Europe", type: "Continental" },
  { code: "SA", name: "Serie A", country: "Italy", type: "Domestic League" },
  { code: "BL1", name: "Bundesliga", country: "Germany", type: "Domestic League" },
];

export const matches = [
  {
    id: "match-1",
    competition: "Premier League",
    kickoffTime: "Today 20:00",
    status: "IN_PLAY" as MatchStatus,
    homeTeam: { name: "Manchester City", crestUrl: null },
    awayTeam: { name: "Arsenal", crestUrl: null },
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: "match-2",
    competition: "Champions League",
    kickoffTime: "Tomorrow 19:45",
    status: "SCHEDULED" as MatchStatus,
    homeTeam: { name: "Inter", crestUrl: null },
    awayTeam: { name: "Dortmund", crestUrl: null },
    homeScore: null,
    awayScore: null,
  },
  {
    id: "match-3",
    competition: "Serie A",
    kickoffTime: "Sat 18:00",
    status: "FINISHED" as MatchStatus,
    homeTeam: { name: "Milan", crestUrl: null },
    awayTeam: { name: "Roma", crestUrl: null },
    homeScore: 1,
    awayScore: 1,
  },
];

export const teams = [
  { id: "team-1", name: "Manchester City", competition: "Premier League", form: ["W", "W", "D", "W", "L"] as const },
  { id: "team-2", name: "Arsenal", competition: "Premier League", form: ["W", "L", "W", "D", "W"] as const },
  { id: "team-3", name: "Inter", competition: "Serie A", form: ["D", "W", "W", "W", "D"] as const },
];

export const players = [
  { id: "player-1", name: "Erling Haaland", position: "FWD", team: "Manchester City" },
  { id: "player-2", name: "Bukayo Saka", position: "FWD", team: "Arsenal" },
  { id: "player-3", name: "Nicolo Barella", position: "MID", team: "Inter" },
  { id: "player-4", name: "William Saliba", position: "DEF", team: "Arsenal" },
];

export const standings = [
  { position: 1, team: { id: "team-1", name: "Manchester City", crestUrl: null }, played: 20, won: 15, drawn: 3, lost: 2, goalsFor: 48, goalsAgainst: 18, points: 48 },
  { position: 2, team: { id: "team-2", name: "Arsenal", crestUrl: null }, played: 20, won: 14, drawn: 4, lost: 2, goalsFor: 42, goalsAgainst: 17, points: 46 },
  { position: 3, team: { id: "team-3", name: "Inter", crestUrl: null }, played: 20, won: 12, drawn: 5, lost: 3, goalsFor: 34, goalsAgainst: 19, points: 41 },
  { position: 18, team: { id: "team-4", name: "Everton", crestUrl: null }, played: 20, won: 4, drawn: 5, lost: 11, goalsFor: 17, goalsAgainst: 32, points: 17 },
];
