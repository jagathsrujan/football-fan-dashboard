import { NextRequest, NextResponse } from "next/server";
import { getSchedule } from "@/lib/queries/get-schedule";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function weekRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  // Start of current week (Monday)
  const dayOfWeek = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((dayOfWeek + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    dateFrom: monday.toISOString().slice(0, 10),
    dateTo: sunday.toISOString().slice(0, 10),
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const defaults = weekRange();
  const dateFrom = params.get("dateFrom") ?? defaults.dateFrom;
  const dateTo = params.get("dateTo") ?? defaults.dateTo;
  const competitionIds = params.get("competitionIds")?.split(",").filter(Boolean) ?? undefined;

  try {
    const schedule = await getSchedule(dateFrom, dateTo, competitionIds);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error("[api/schedule]", error);
    return NextResponse.json(
      { error: "Unable to load schedule", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
