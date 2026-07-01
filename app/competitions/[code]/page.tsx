import { CompetitionDetailClient } from "@/components/competitions/competition-detail-client";

export default async function CompetitionDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <CompetitionDetailClient code={code.toUpperCase()} />;
}
