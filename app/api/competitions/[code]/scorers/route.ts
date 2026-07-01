import { NextResponse } from "next/server";
import { NotFoundError } from "@/lib/queries/errors";
import { getScorers } from "@/lib/queries/get-scorers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  try {
    return NextResponse.json(await getScorers(code));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[api/competitions/:code/scorers]", error);
    return NextResponse.json({ error: "Unable to load scorers", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
