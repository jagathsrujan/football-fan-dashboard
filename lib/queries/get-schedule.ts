import type { MatchStatus } from "@prisma/client";
import { cacheGet, cacheSet } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export type ScheduleFixture = {
  id: string;
  matchday: number | null;
  kickoffTime: string;
  status: MatchStatus;
  venue: string | null;
  competition: {
    id: string;
    name: string;
    code: string | null;
    emblemUrl: string | null;
  };
  homeTeam: { id: string; name: string; crestUrl: string | null };
  awayTeam: { id: string; name: string; crestUrl: string | null };
  homeScore: number | null;
  awayScore: number | null;
};

export type ScheduleDay = {
  date: string; // ISO date string YYYY-MM-DD
  label: string; // Human-readable label
  fixtures: ScheduleFixture[];
};

export type SchedulePayload = {
  dateFrom: string;
  dateTo: string;
  days: ScheduleDay[];
  competitions: Array<{ id: string; name: string; code: string | null; emblemUrl: string | null }>;
};

const TTL = 300; // 5 minutes — matches change frequently

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getSchedule(
  dateFrom: string,
  dateTo: string,
  competitionIds?: string[],
): Promise<SchedulePayload> {
  // Build a deterministic cache key
  const compKey = competitionIds?.length ? competitionIds.sort().join(",") : "all";
  const cacheKeyStr = `schedule:v1:${dateFrom}:${dateTo}:${compKey}`;
  const cached = await cacheGet<SchedulePayload>(cacheKeyStr);
  if (cached) return cached;

  const from = new Date(`${dateFrom}T00:00:00Z`);
  const to = new Date(`${dateTo}T23:59:59.999Z`);

  const matches = await prisma.match.findMany({
    where: {
      kickoffTime: { gte: from, lte: to },
      ...(competitionIds?.length ? { competitionId: { in: competitionIds } } : {}),
    },
    orderBy: [{ kickoffTime: "asc" }],
    include: {
      homeTeam: true,
      awayTeam: true,
      competition: true,
    },
  });

  // Group fixtures by date
  const dayMap = new Map<string, ScheduleFixture[]>();

  for (const match of matches) {
    const dateStr = toDateString(match.kickoffTime);
    const fixtures = dayMap.get(dateStr) ?? [];
    fixtures.push({
      id: match.id,
      matchday: match.matchday,
      kickoffTime: match.kickoffTime.toISOString(),
      status: match.status,
      venue: match.venue,
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        code: match.competition.code,
        emblemUrl: match.competition.emblemUrl,
      },
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        crestUrl: match.homeTeam.crestUrl,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        crestUrl: match.awayTeam.crestUrl,
      },
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    });
    dayMap.set(dateStr, fixtures);
  }

  // Build days array covering the full date range (include empty days for week grid)
  const days: ScheduleDay[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    const dateStr = toDateString(cursor);
    days.push({
      date: dateStr,
      label: formatDateLabel(cursor),
      fixtures: dayMap.get(dateStr) ?? [],
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // Collect unique competitions for the filter bar
  const competitionMap = new Map<string, { id: string; name: string; code: string | null; emblemUrl: string | null }>();
  for (const match of matches) {
    if (!competitionMap.has(match.competition.id)) {
      competitionMap.set(match.competition.id, {
        id: match.competition.id,
        name: match.competition.name,
        code: match.competition.code,
        emblemUrl: match.competition.emblemUrl,
      });
    }
  }

  const payload: SchedulePayload = {
    dateFrom,
    dateTo,
    days,
    competitions: Array.from(competitionMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
  };

  await cacheSet(cacheKeyStr, payload, TTL);
  return payload;
}
