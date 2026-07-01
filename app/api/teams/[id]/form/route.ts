import { NextResponse } from "next/server";
import { NotFoundError } from "@/lib/queries/errors";
import { getTeamForm } from "@/lib/queries/get-team-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    return NextResponse.json(await getTeamForm(id));
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 404 });
    }
    console.error("[api/teams/:id/form]", error);
    return NextResponse.json({ error: "Unable to load team form", code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
