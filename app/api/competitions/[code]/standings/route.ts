import { NextResponse } from "next/server";
import { NotFoundError } from "@/lib/queries/errors";
import { getStandings } from "@/lib/queries/get-standings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  try {
    return NextResponse.json(await getStandings(code));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[api/competitions/:code/standings]", error);
    return NextResponse.json({ error: "Unable to load standings", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
