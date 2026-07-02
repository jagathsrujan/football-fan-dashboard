"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

type FavoriteEntityType = "TEAM" | "PLAYER";

export type EnrichedFavorite = {
  id: string;
  entityType: FavoriteEntityType;
  entityId: string;
  createdAt: string;
  entity: {
    id: string;
    name: string;
    crestUrl?: string | null;
    photoUrl?: string | null;
    country?: string | null;
    position?: string | null;
    currentTeam?: { name: string } | null;
  } | null;
};

type FavoritesState = {
  favorites: EnrichedFavorite[];
  loading: boolean;
  error: string | null;
};

export function useFavorites() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [state, setState] = useState<FavoritesState>({
    favorites: [],
    loading: true,
    error: null,
  });

  const fetchFavorites = useCallback(async () => {
    if (!session) {
      setState({ favorites: [], loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch("/api/favorites", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load favorites");
      const data = await res.json();
      setState({ favorites: data.favorites, loading: false, error: null });
    } catch (err) {
      setState({ favorites: [], loading: false, error: err instanceof Error ? err.message : "Failed" });
    }
  }, [session]);

  useEffect(() => {
    if (!sessionLoading) {
      void fetchFavorites();
    }
  }, [sessionLoading, fetchFavorites]);

  function isFavorited(entityType: FavoriteEntityType, entityId: string): boolean {
    return state.favorites.some((f) => f.entityType === entityType && f.entityId === entityId);
  }

  function getFavoriteId(entityType: FavoriteEntityType, entityId: string): string | undefined {
    return state.favorites.find((f) => f.entityType === entityType && f.entityId === entityId)?.id;
  }

  async function addFavorite(entityType: FavoriteEntityType, entityId: string) {
    if (!session) return;
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId }),
      });
      if (res.ok) {
        await fetchFavorites();
      }
    } catch {
      // Silently fail — will be retried on next fetch
    }
  }

  async function removeFavorite(favoriteId: string) {
    if (!session) return;
    // Optimistic removal
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.filter((f) => f.id !== favoriteId),
    }));
    try {
      const res = await fetch(`/api/favorites/${favoriteId}`, { method: "DELETE" });
      if (!res.ok) {
        await fetchFavorites(); // Revert on failure
      }
    } catch {
      await fetchFavorites();
    }
  }

  async function toggle(entityType: FavoriteEntityType, entityId: string) {
    const existingId = getFavoriteId(entityType, entityId);
    if (existingId) {
      await removeFavorite(existingId);
    } else {
      await addFavorite(entityType, entityId);
    }
  }

  return {
    ...state,
    isAuthenticated: !!session,
    sessionLoading,
    isFavorited,
    toggle,
    removeFavorite,
    refetch: fetchFavorites,
  };
}
