import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.userFavorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with entity data
  const teamIds = favorites.filter((f) => f.entityType === "TEAM").map((f) => f.entityId);
  const playerIds = favorites.filter((f) => f.entityType === "PLAYER").map((f) => f.entityId);

  const [teams, players] = await Promise.all([
    teamIds.length > 0
      ? prisma.team.findMany({
          where: { id: { in: teamIds } },
          select: { id: true, name: true, crestUrl: true, country: true },
        })
      : [],
    playerIds.length > 0
      ? prisma.player.findMany({
          where: { id: { in: playerIds } },
          select: { id: true, name: true, photoUrl: true, position: true, currentTeam: { select: { name: true } } },
        })
      : [],
  ]);

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const enriched = favorites.map((f) => ({
    id: f.id,
    entityType: f.entityType,
    entityId: f.entityId,
    createdAt: f.createdAt.toISOString(),
    entity:
      f.entityType === "TEAM"
        ? teamMap.get(f.entityId) ?? null
        : playerMap.get(f.entityId) ?? null,
  }));

  return NextResponse.json({ favorites: enriched });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entityType, entityId } = body;

  if (!entityType || !entityId || !["TEAM", "PLAYER"].includes(entityType)) {
    return NextResponse.json(
      { error: "Invalid body. Requires { entityType: 'TEAM' | 'PLAYER', entityId: string }" },
      { status: 400 },
    );
  }

  try {
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: session.user.id,
        entityType,
        entityId,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error: unknown) {
    // Prisma unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Already favorited" }, { status: 409 });
    }
    console.error("[api/favorites] POST error:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}
