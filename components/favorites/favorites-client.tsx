"use client";

import Link from "next/link";
import { LogIn, Star, Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useFavorites, type EnrichedFavorite } from "@/hooks/use-favorites";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Crest } from "@/components/football/crest";
import { PlayerAvatar } from "@/components/football/player-avatar";

function FavoriteSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-hairline bg-surface p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FavoriteRow({
  favorite,
  onRemove,
}: {
  favorite: EnrichedFavorite;
  onRemove: (id: string) => void;
}) {
  const isTeam = favorite.entityType === "TEAM";
  const href = isTeam ? `/teams/${favorite.entityId}` : `/players/${favorite.entityId}`;
  const name = favorite.entity?.name ?? "Unknown";

  return (
    <div className="flex items-center gap-3 rounded-md border border-hairline bg-surface p-3 transition-colors hover:border-floodlight/30">
      <Link href={href} className="flex min-w-0 flex-1 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40 rounded">
        {isTeam ? (
          <Crest
            src={favorite.entity?.crestUrl ?? null}
            alt={`${name} crest`}
            size={36}
          />
        ) : (
          <PlayerAvatar
            name={name}
            photoUrl={favorite.entity?.photoUrl ?? null}
            size={36}
            teamAccent="#F5B842"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-xs text-secondary">
            {isTeam
              ? favorite.entity?.country ?? "Team"
              : `${favorite.entity?.position ?? "Player"}${favorite.entity?.currentTeam ? ` · ${favorite.entity.currentTeam.name}` : ""}`}
          </p>
        </div>
        <Badge variant={isTeam ? "info" : "neutral"}>
          {isTeam ? "Team" : "Player"}
        </Badge>
      </Link>
      <button
        type="button"
        onClick={() => onRemove(favorite.id)}
        className="shrink-0 rounded p-2 text-secondary transition-colors hover:bg-loss/20 hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40"
        aria-label={`Remove ${name} from favorites`}
      >
        <Trash2 size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function FavoritesClient() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { favorites, loading, error, removeFavorite } = useFavorites();

  // Unauthenticated state
  if (!sessionLoading && !session) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">Your collection</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Favorites</h1>
        </div>
        <Card className="mb-6">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Star size={40} strokeWidth={1.5} className="text-muted" />
            <div>
              <p className="font-semibold">Sign in to collect favorites</p>
              <p className="mt-1 text-sm text-secondary">
                Favorite teams and players to get personalized content on your
                Home page.
              </p>
            </div>
            <Link href="/sign-in">
              <Button className="gap-2">
                <LogIn size={16} strokeWidth={1.75} />
                Sign in
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const teamFavorites = favorites.filter((f) => f.entityType === "TEAM");
  const playerFavorites = favorites.filter((f) => f.entityType === "PLAYER");

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-secondary">Your collection</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Favorites</h1>
      </div>

      {(loading || sessionLoading) && <FavoriteSkeleton />}

      {error && (
        <EmptyState
          icon={Star}
          message={error}
          variant="error"
        />
      )}

      {!loading && !sessionLoading && !error && favorites.length === 0 && (
        <EmptyState
          icon={Star}
          message="No favorites yet. Browse teams and players to start your collection."
        />
      )}

      {!loading && !error && teamFavorites.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl font-semibold">
            Favorite Teams ({teamFavorites.length})
          </h2>
          <div className="space-y-2">
            {teamFavorites.map((fav) => (
              <FavoriteRow key={fav.id} favorite={fav} onRemove={removeFavorite} />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && playerFavorites.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-xl font-semibold">
            Favorite Players ({playerFavorites.length})
          </h2>
          <div className="space-y-2">
            {playerFavorites.map((fav) => (
              <FavoriteRow key={fav.id} favorite={fav} onRemove={removeFavorite} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
