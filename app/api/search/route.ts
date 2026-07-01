import { NextRequest, NextResponse } from "next/server";
import { searchIndex } from "@/lib/queries/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  try {
    const results = await searchIndex(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error("[api/search]", error);
    return NextResponse.json(
      { error: "Unable to search", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
