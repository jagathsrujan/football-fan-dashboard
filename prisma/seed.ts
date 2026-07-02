import { PrismaClient, CompetitionType, TeamType, Position, MatchStatus, MatchEventType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Confederations & Federations
  const uefa = await prisma.confederation.upsert({
    where: { code: "UEFA" },
    update: {},
    create: { name: "UEFA", code: "UEFA" },
  });

  const fedEngland = await prisma.federation.upsert({
    where: { id: "fed-england" },
    update: {},
    create: { id: "fed-england", name: "The FA", country: "England", confederationId: uefa.id },
  });

  const fedSpain = await prisma.federation.upsert({
    where: { id: "fed-spain" },
    update: {},
    create: { id: "fed-spain", name: "RFEF", country: "Spain", confederationId: uefa.id },
  });

  const fedGermany = await prisma.federation.upsert({
    where: { id: "fed-germany" },
    update: {},
    create: { id: "fed-germany", name: "DFB", country: "Germany", confederationId: uefa.id },
  });

  const fedItaly = await prisma.federation.upsert({
    where: { id: "fed-italy" },
    update: {},
    create: { id: "fed-italy", name: "FIGC", country: "Italy", confederationId: uefa.id },
  });

  // 2. Competitions
  const pl = await prisma.competition.upsert({
    where: { code: "PL" },
    update: {},
    create: {
      name: "Premier League",
      code: "PL",
      type: CompetitionType.LEAGUE,
      tier: 1,
      federationId: fedEngland.id,
      confederationId: uefa.id,
    },
  });

  const cl = await prisma.competition.upsert({
    where: { code: "CL" },
    update: {},
    create: {
      name: "UEFA Champions League",
      code: "CL",
      type: CompetitionType.CONTINENTAL,
      tier: null,
      confederationId: uefa.id,
    },
  });

  // 3. Seasons
  const plSeason = await prisma.season.upsert({
    where: { competitionId_yearLabel: { competitionId: pl.id, yearLabel: "2025/26" } },
    update: { isCurrent: true },
    create: {
      competitionId: pl.id,
      yearLabel: "2025/26",
      startDate: new Date("2025-08-15T00:00:00Z"),
      endDate: new Date("2026-05-24T00:00:00Z"),
      isCurrent: true,
    },
  });

  const clSeason = await prisma.season.upsert({
    where: { competitionId_yearLabel: { competitionId: cl.id, yearLabel: "2025/26" } },
    update: { isCurrent: true },
    create: {
      competitionId: cl.id,
      yearLabel: "2025/26",
      startDate: new Date("2025-09-16T00:00:00Z"),
      endDate: new Date("2026-05-30T00:00:00Z"),
      isCurrent: true,
    },
  });

  // 4. Teams
  const teamsData = [
    { id: "team-ars", name: "Arsenal FC", shortName: "Arsenal", country: "England", fedId: fedEngland.id, colors: "Red / White" },
    { id: "team-mci", name: "Manchester City FC", shortName: "Man City", country: "England", fedId: fedEngland.id, colors: "Sky Blue / White" },
    { id: "team-liv", name: "Liverpool FC", shortName: "Liverpool", country: "England", fedId: fedEngland.id, colors: "Red / White" },
    { id: "team-che", name: "Chelsea FC", shortName: "Chelsea", country: "England", fedId: fedEngland.id, colors: "Blue / White" },
    { id: "team-rma", name: "Real Madrid CF", shortName: "Real Madrid", country: "Spain", fedId: fedSpain.id, colors: "White / Purple" },
    { id: "team-bar", name: "FC Barcelona", shortName: "Barcelona", country: "Spain", fedId: fedSpain.id, colors: "Red / Blue" },
    { id: "team-bay", name: "FC Bayern München", shortName: "Bayern", country: "Germany", fedId: fedGermany.id, colors: "Red / White" },
    { id: "team-int", name: "FC Internazionale Milano", shortName: "Inter", country: "Italy", fedId: fedItaly.id, colors: "Black / Blue" },
  ];

  for (const t of teamsData) {
    await prisma.team.upsert({
      where: { id: t.id },
      update: { name: t.name, shortName: t.shortName, clubColors: t.colors },
      create: {
        id: t.id,
        name: t.name,
        shortName: t.shortName,
        type: TeamType.CLUB,
        country: t.country,
        federationId: t.fedId,
        clubColors: t.colors,
      },
    });
  }

  // 5. Players & Squad Memberships
  const playersData = [
    { id: "p-haaland", name: "Erling Haaland", nationality: "Norway", pos: Position.FWD, team: "team-mci", number: 9 },
    { id: "p-foden", name: "Phil Foden", nationality: "England", pos: Position.MID, team: "team-mci", number: 47 },
    { id: "p-rodri", name: "Rodri", nationality: "Spain", pos: Position.MID, team: "team-mci", number: 16 },
    { id: "p-saka", name: "Bukayo Saka", nationality: "England", pos: Position.FWD, team: "team-ars", number: 7 },
    { id: "p-odegaard", name: "Martin Ødegaard", nationality: "Norway", pos: Position.MID, team: "team-ars", number: 8 },
    { id: "p-saliba", name: "William Saliba", nationality: "France", pos: Position.DEF, team: "team-ars", number: 2 },
    { id: "p-salah", name: "Mohamed Salah", nationality: "Egypt", pos: Position.FWD, team: "team-liv", number: 11 },
    { id: "p-vandijk", name: "Virgil van Dijk", nationality: "Netherlands", pos: Position.DEF, team: "team-liv", number: 4 },
    { id: "p-alisson", name: "Alisson Becker", nationality: "Brazil", pos: Position.GK, team: "team-liv", number: 1 },
    { id: "p-palmer", name: "Cole Palmer", nationality: "England", pos: Position.MID, team: "team-che", number: 20 },
    { id: "p-mbappe", name: "Kylian Mbappé", nationality: "France", pos: Position.FWD, team: "team-rma", number: 9 },
    { id: "p-vinicius", name: "Vinícius Júnior", nationality: "Brazil", pos: Position.FWD, team: "team-rma", number: 7 },
    { id: "p-bellingham", name: "Jude Bellingham", nationality: "England", pos: Position.MID, team: "team-rma", number: 5 },
    { id: "p-kane", name: "Harry Kane", nationality: "England", pos: Position.FWD, team: "team-bay", number: 9 },
    { id: "p-musiala", name: "Jamal Musiala", nationality: "Germany", pos: Position.MID, team: "team-bay", number: 42 },
    { id: "p-lautaro", name: "Lautaro Martínez", nationality: "Argentina", pos: Position.FWD, team: "team-int", number: 10 },
  ];

  for (const p of playersData) {
    await prisma.player.upsert({
      where: { id: p.id },
      update: { name: p.name, currentTeamId: p.team, position: p.pos },
      create: {
        id: p.id,
        name: p.name,
        nationality: p.nationality,
        position: p.pos,
        currentTeamId: p.team,
      },
    });

    const seasonId = p.team === "team-rma" || p.team === "team-bay" || p.team === "team-int" || p.team === "team-bar" ? clSeason.id : plSeason.id;
    await prisma.squadMembership.upsert({
      where: { teamId_playerId_seasonId: { teamId: p.team, playerId: p.id, seasonId } },
      update: { shirtNumber: p.number },
      create: {
        teamId: p.team,
        playerId: p.id,
        seasonId,
        shirtNumber: p.number,
      },
    });
  }

  // 6. Matches & Events
  const match1 = await prisma.match.upsert({
    where: { id: "match-pl-1" },
    update: { homeScore: 2, awayScore: 1, status: MatchStatus.FINISHED },
    create: {
      id: "match-pl-1",
      competitionId: pl.id,
      seasonId: plSeason.id,
      homeTeamId: "team-ars",
      awayTeamId: "team-che",
      kickoffTime: new Date(Date.now() - 86400000 * 2),
      venue: "Emirates Stadium",
      matchday: 1,
      status: MatchStatus.FINISHED,
      homeScore: 2,
      awayScore: 1,
    },
  });

  await prisma.matchEvent.deleteMany({ where: { matchId: match1.id } });
  await prisma.matchEvent.createMany({
    data: [
      { matchId: match1.id, minute: 23, type: MatchEventType.GOAL, playerId: "p-saka", detail: "assist: Martin Ødegaard" },
      { matchId: match1.id, minute: 45, type: MatchEventType.GOAL, playerId: "p-palmer", detail: "" },
      { matchId: match1.id, minute: 78, type: MatchEventType.GOAL, playerId: "p-odegaard", detail: "" },
    ],
  });

  const match2 = await prisma.match.upsert({
    where: { id: "match-pl-2" },
    update: { homeScore: 3, awayScore: 1, status: MatchStatus.FINISHED },
    create: {
      id: "match-pl-2",
      competitionId: pl.id,
      seasonId: plSeason.id,
      homeTeamId: "team-mci",
      awayTeamId: "team-liv",
      kickoffTime: new Date(Date.now() - 86400000),
      venue: "Etihad Stadium",
      matchday: 1,
      status: MatchStatus.FINISHED,
      homeScore: 3,
      awayScore: 1,
    },
  });

  await prisma.matchEvent.deleteMany({ where: { matchId: match2.id } });
  await prisma.matchEvent.createMany({
    data: [
      { matchId: match2.id, minute: 12, type: MatchEventType.GOAL, playerId: "p-haaland", detail: "assist: Kevin De Bruyne" },
      { matchId: match2.id, minute: 34, type: MatchEventType.GOAL, playerId: "p-salah", detail: "" },
      { matchId: match2.id, minute: 55, type: MatchEventType.GOAL, playerId: "p-haaland", detail: "" },
      { matchId: match2.id, minute: 89, type: MatchEventType.GOAL, playerId: "p-foden", detail: "" },
    ],
  });

  await prisma.match.upsert({
    where: { id: "match-pl-3" },
    update: { status: MatchStatus.SCHEDULED },
    create: {
      id: "match-pl-3",
      competitionId: pl.id,
      seasonId: plSeason.id,
      homeTeamId: "team-ars",
      awayTeamId: "team-mci",
      kickoffTime: new Date(Date.now() + 86400000 * 3),
      venue: "Emirates Stadium",
      matchday: 2,
      status: MatchStatus.SCHEDULED,
    },
  });

  const match4 = await prisma.match.upsert({
    where: { id: "match-cl-1" },
    update: { homeScore: 2, awayScore: 2, status: MatchStatus.FINISHED },
    create: {
      id: "match-cl-1",
      competitionId: cl.id,
      seasonId: clSeason.id,
      homeTeamId: "team-rma",
      awayTeamId: "team-bay",
      kickoffTime: new Date(Date.now() - 86400000 * 3),
      venue: "Estadio Santiago Bernabéu",
      matchday: 1,
      status: MatchStatus.FINISHED,
      homeScore: 2,
      awayScore: 2,
    },
  });

  await prisma.matchEvent.deleteMany({ where: { matchId: match4.id } });
  await prisma.matchEvent.createMany({
    data: [
      { matchId: match4.id, minute: 15, type: MatchEventType.GOAL, playerId: "p-mbappe", detail: "" },
      { matchId: match4.id, minute: 38, type: MatchEventType.GOAL, playerId: "p-kane", detail: "penalty" },
      { matchId: match4.id, minute: 62, type: MatchEventType.GOAL, playerId: "p-kane", detail: "assist: Jamal Musiala" },
      { matchId: match4.id, minute: 81, type: MatchEventType.GOAL, playerId: "p-vinicius", detail: "" },
    ],
  });

  await prisma.match.upsert({
    where: { id: "match-cl-2" },
    update: { status: MatchStatus.SCHEDULED },
    create: {
      id: "match-cl-2",
      competitionId: cl.id,
      seasonId: clSeason.id,
      homeTeamId: "team-mci",
      awayTeamId: "team-rma",
      kickoffTime: new Date(Date.now() + 86400000 * 5),
      venue: "Etihad Stadium",
      matchday: 2,
      status: MatchStatus.SCHEDULED,
    },
  });

  // 7. Standings
  const plStandings = [
    { teamId: "team-mci", pos: 1, played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 1, pts: 3 },
    { teamId: "team-ars", pos: 2, played: 1, won: 1, drawn: 0, lost: 0, gf: 2, ga: 1, pts: 3 },
    { teamId: "team-che", pos: 3, played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 2, pts: 0 },
    { teamId: "team-liv", pos: 4, played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 3, pts: 0 },
  ];

  for (const s of plStandings) {
    await prisma.standing.upsert({
      where: { competitionId_seasonId_teamId: { competitionId: pl.id, seasonId: plSeason.id, teamId: s.teamId } },
      update: { position: s.pos, played: s.played, won: s.won, drawn: s.drawn, lost: s.lost, goalsFor: s.gf, goalsAgainst: s.ga, points: s.pts },
      create: {
        competitionId: pl.id,
        seasonId: plSeason.id,
        teamId: s.teamId,
        position: s.pos,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        points: s.pts,
      },
    });
  }

  const clStandings = [
    { teamId: "team-rma", pos: 1, played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, pts: 1 },
    { teamId: "team-bay", pos: 2, played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, pts: 1 },
  ];

  for (const s of clStandings) {
    await prisma.standing.upsert({
      where: { competitionId_seasonId_teamId: { competitionId: cl.id, seasonId: clSeason.id, teamId: s.teamId } },
      update: { position: s.pos, played: s.played, won: s.won, drawn: s.drawn, lost: s.lost, goalsFor: s.gf, goalsAgainst: s.ga, points: s.pts },
      create: {
        competitionId: cl.id,
        seasonId: clSeason.id,
        teamId: s.teamId,
        position: s.pos,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.gf,
        goalsAgainst: s.ga,
        points: s.pts,
      },
    });
  }

  console.log("✅ Seed completed successfully! Seeded PL and CL competitions, 8 teams, 12 players, matches, and standings.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
