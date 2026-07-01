import { NextRequest, NextResponse } from "next/server";
import { syncFootballData } from "@/lib/ingestion/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-vercel-cron");

  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }

  // Vercel Hobby cron does not attach the CRON_SECRET header automatically.
  // Vercel does set x-vercel-cron on its own cron invocations, so accept it
  // as the free-tier scheduled path while keeping CRON_SECRET for manual calls.
  return Boolean(cronHeader);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const summary = await syncFootballData();
    const body = summary.ok
      ? {
          ok: true,
          competitionsUpdated: summary.competitionsUpdated,
          matchesUpdated: summary.matchesUpdated,
          durationMs: summary.durationMs,
        }
      : {
          ok: false,
          partial: true,
          failedResources: summary.failedResources,
          competitionsUpdated: summary.competitionsUpdated,
          matchesUpdated: summary.matchesUpdated,
          durationMs: summary.durationMs,
        };

    return NextResponse.json(body, { status: summary.ok ? 200 : 207 });
  } catch (error) {
    console.error("[cron/sync] sync failed", error);
    return NextResponse.json(
      {
        ok: false,
        partial: true,
        failedResources: ["sync"],
      },
      { status: 500 },
    );
  }
}
