"use client";

import Link from "next/link";
import { CalendarDays, Star, Trophy, Users } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useFavorites } from "@/hooks/use-favorites";
import { MatchCard } from "@/components/football/match-card";
import { TeamCard } from "@/components/football/team-card";
import { PlayerCard } from "@/components/football/player-card";
import { Crest } from "@/components/football/crest";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { competitions, matches, teams, players } from "@/components/mock/data";
import { useCallback, useEffect, useState } from "react";
import type { MatchStatus } from "@/components/football/types";

type UpcomingMatch = {
  id: string;
  competition: string;
  kickoffTime: string;
  status: MatchStatus;
  homeTeam: { name: string; crestUrl: string | null };
  awayTeam: { name: string; crestUrl: string | null };
  homeScore: number | null;
  awayScore: number | null;
};

function YourTeamsHero({ teamIds }: { teamIds: string[] }) {
  const [upcoming, setUpcoming] = useState<UpcomingMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcoming = useCallback(async () => {
    if (teamIds.length === 0) return;
    setLoading(true);
    try {
      // Fetch schedule for the current week
      const res = await fetch("/api/schedule", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Find matches involving any of the user's favorite teams
      const teamIdSet = new Set(teamIds);
      const matchList: UpcomingMatch[] = [];

      for (const day of data.days ?? []) {
        for (const fixture of day.fixtures ?? []) {
          if (teamIdSet.has(fixture.homeTeam?.id) || teamIdSet.has(fixture.awayTeam?.id)) {
            matchList.push({
              id: fixture.id,
              competition: fixture.competition?.name ?? "",
              kickoffTime: fixture.kickoffTime,
              status: fixture.status,
              homeTeam: { name: fixture.homeTeam.name, crestUrl: fixture.homeTeam.crestUrl },
              awayTeam: { name: fixture.awayTeam.name, crestUrl: fixture.awayTeam.crestUrl },
              homeScore: fixture.homeScore,
              awayScore: fixture.awayScore,
            });
          }
        }
      }
      setUpcoming(matchList.slice(0, 6));
    } catch {
      // Silent fail — hero section will just be empty
    } finally {
      setLoading(false);
    }
  }, [teamIds]);

  useEffect(() => {
    void fetchUpcoming();
  }, [fetchUpcoming]);

  return (
    <section className="mb-8">
      <h2 className="mb-4 font-display text-2xl font-semibold">
        <span className="inline-flex items-center gap-2">
          <Star size={22} strokeWidth={1.75} className="text-floodlight" />
          Your Teams — This Week
        </span>
      </h2>
      {loading && (
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-md border border-hairline bg-surface p-4">
              <Skeleton className="mb-3 h-5 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}
      {!loading && upcoming.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-3">
          {upcoming.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
      {!loading && upcoming.length === 0 && (
        <Card>
          <p className="text-sm text-secondary">
            No matches for your favorite teams this week.{" "}
            <Link href="/schedule" className="text-floodlight underline underline-offset-2">
              Check the full schedule →
            </Link>
          </p>
        </Card>
      )}
    </section>
  );
}

function FavoriteTeamsPills({ favorites }: { favorites: Array<{ entityId: string; entity: { name: string; crestUrl?: string | null } | null }> }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {favorites.map((fav) => (
        <Link key={fav.entityId} href={`/teams/${fav.entityId}`}>
          <Badge variant="info" className="gap-1.5">
            <Crest src={fav.entity?.crestUrl ?? null} alt={`${fav.entity?.name ?? "Team"} crest`} size={14} />
            {fav.entity?.name ?? "Team"}
          </Badge>
        </Link>
      ))}
      <Link href="/favorites">
        <Badge className="gap-1">
          <Star size={12} />
          Manage
        </Badge>
      </Link>
    </div>
  );
}

export function HomeClient() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { favorites, loading: favoritesLoading } = useFavorites();

  const isAuthenticated = !!session;
  const isLoading = sessionLoading || favoritesLoading;
  const teamFavorites = favorites.filter((f) => f.entityType === "TEAM");
  const hasTeamFavorites = teamFavorites.length > 0;

  return (
    <div>
      {/* Hero / Greeter */}
      <section className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-secondary">Dashboard</p>
        <h1 className="mt-2 font-display text-4xl font-bold">
          {isAuthenticated && session?.user?.name
            ? `Welcome, ${session.user.name.split(" ")[0]}`
            : "Welcome back"}
        </h1>
        {!isAuthenticated && (
          <p className="mt-1 text-secondary">
            <Link href="/sign-in" className="text-floodlight underline underline-offset-2">Sign in</Link>
            {" "}to personalize your dashboard with favorite teams.
          </p>
        )}
      </section>

      {/* Personalized hero: Your Teams upcoming matches */}
      {isAuthenticated && hasTeamFavorites && !isLoading && (
        <>
          <FavoriteTeamsPills favorites={teamFavorites} />
          <YourTeamsHero teamIds={teamFavorites.map((f) => f.entityId)} />
        </>
      )}

      {/* Loading state for personalized section */}
      {isAuthenticated && isLoading && (
        <div className="mb-8">
          <Skeleton className="mb-4 h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      )}

      {/* Today's Matches (mock — shown for all users) */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl font-semibold">Today&apos;s Matches</h2>
        <div className="grid gap-4 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* Top Competitions */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl font-semibold">Top Competitions</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {competitions.map((comp) => (
            <Link key={comp.code} href={`/competitions/${comp.code}`}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <Badge>{comp.type}</Badge>
                </CardHeader>
                <p className="text-sm text-secondary">{comp.country}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Teams */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl font-semibold">
          <span className="inline-flex items-center gap-2">
            <Users size={22} strokeWidth={1.75} /> Featured Teams
          </span>
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} competition={team.competition} form={team.form} name={team.name} />
          ))}
        </div>
      </section>

      {/* Featured Players */}
      <section className="mb-8">
        <h2 className="mb-4 font-display text-2xl font-semibold">Featured Players</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {players.map((player) => (
            <PlayerCard key={player.id} name={player.name} position={player.position} team={player.team} />
          ))}
        </div>
      </section>

      {/* Quick links */}
      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/competitions">
          <Card>
            <div className="flex items-center gap-3">
              <Trophy size={22} strokeWidth={1.75} className="text-floodlight" />
              <span className="font-semibold">All Competitions</span>
            </div>
          </Card>
        </Link>
        <Link href="/schedule">
          <Card>
            <div className="flex items-center gap-3">
              <CalendarDays size={22} strokeWidth={1.75} className="text-floodlight" />
              <span className="font-semibold">Match Schedule</span>
            </div>
          </Card>
        </Link>
        <Link href="/favorites">
          <Card>
            <div className="flex items-center gap-3">
              <Star size={22} strokeWidth={1.75} className="text-floodlight" />
              <span className="font-semibold">My Favorites</span>
            </div>
          </Card>
        </Link>
      </section>
    </div>
  );
}
