import { PlayerDetailClient } from "@/components/players/player-detail-client";

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlayerDetailClient playerId={id} />;
}
