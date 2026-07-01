import { NextRequest, NextResponse } from "next/server";
import { NotFoundError } from "@/lib/queries/errors";
import { getFixtures } from "@/lib/queries/get-fixtures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  try {
    return NextResponse.json(
      await getFixtures(code, {
        status: request.nextUrl.searchParams.get("status"),
        matchday: request.nextUrl.searchParams.get("matchday"),
      }),
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[api/competitions/:code/fixtures]", error);
    return NextResponse.json({ error: "Unable to load fixtures", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
