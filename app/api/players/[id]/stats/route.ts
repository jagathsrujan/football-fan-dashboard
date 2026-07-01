import { NextResponse } from "next/server";
import { NotFoundError } from "@/lib/queries/errors";
import { getPlayerStats } from "@/lib/queries/get-player-stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    return NextResponse.json(await getPlayerStats(id));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[api/players/:id/stats]", error);
    return NextResponse.json({ error: "Unable to load player stats", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
