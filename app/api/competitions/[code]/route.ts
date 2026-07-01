import { NextResponse } from "next/server";
import { NotFoundError } from "@/lib/queries/errors";
import { getCompetitionByCode } from "@/lib/queries/get-competitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  try {
    return NextResponse.json({ competition: await getCompetitionByCode(code) });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[api/competitions/:code]", error);
    return NextResponse.json({ error: "Unable to load competition", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
