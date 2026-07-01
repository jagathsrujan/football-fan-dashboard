import { NextResponse } from "next/server";
import { getCompetitions } from "@/lib/queries/get-competitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ competitions: await getCompetitions() });
  } catch (error) {
    console.error("[api/competitions]", error);
    return NextResponse.json({ error: "Unable to load competitions", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
