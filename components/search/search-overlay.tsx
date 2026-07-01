"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Trophy, Users, User } from "lucide-react";
import { Crest } from "@/components/football/crest";
import { PlayerAvatar } from "@/components/football/player-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SearchResults, SearchIndexEntry } from "@/lib/queries/search";

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce the query
  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setDebouncedQuery("");
      setResults(null);
      return;
    }

    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        return res.json();
      })
      .then((data: SearchResults) => {
        if (!cancelled) {
          setResults(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      // Reset state when opening
      setQuery("");
      setDebouncedQuery("");
      setResults(null);
      setError(false);
      // Small delay to ensure the DOM is rendered before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  const totalCount = results
    ? results.competitions.length + results.teams.length + results.players.length
    : 0;

  const hasResults = results && totalCount > 0;
  const showEmpty = results && totalCount === 0 && debouncedQuery.length >= MIN_QUERY_LENGTH;

  function handleNavigate(route: string) {
    onClose();
    router.push(route);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-base/70 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden border border-hairline bg-surface shadow-2xl",
          // Mobile: full-screen
          "inset-0",
          // Desktop: centered modal
          "md:inset-auto md:left-1/2 md:top-[15%] md:max-h-[70vh] md:w-full md:max-w-lg md:-translate-x-1/2 md:rounded-md",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search size={18} strokeWidth={1.75} className="shrink-0 text-secondary" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search competitions, teams, players…"
            className="h-12 flex-1 bg-transparent text-sm text-primary placeholder:text-muted outline-none"
            aria-label="Search query"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="grid h-7 w-7 shrink-0 place-items-center rounded text-secondary transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-floodlight/40 outline-none"
              aria-label="Clear search"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded text-secondary transition-colors hover:bg-surface-raised hover:text-primary focus-visible:ring-2 focus-visible:ring-floodlight/40 outline-none md:hidden"
            aria-label="Close search"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
          <kbd className="hidden shrink-0 rounded border border-hairline px-1.5 py-0.5 font-data text-[10px] text-muted md:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2" role="listbox" aria-label="Search results">
          {/* Live region for screen reader result count */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {hasResults && `${totalCount} result${totalCount !== 1 ? "s" : ""} found`}
            {showEmpty && `No results found for ${debouncedQuery}`}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-1 p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-7 w-7 shrink-0 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <p className="text-sm text-secondary">Something went wrong. Try again.</p>
            </div>
          )}

          {/* Empty state */}
          {showEmpty && !loading && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Search size={24} strokeWidth={1.75} className="text-muted" />
              <p className="text-sm text-secondary">
                No results for &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>
          )}

          {/* Grouped results */}
          {hasResults && !loading && (
            <>
              <ResultGroup
                label="Competitions"
                icon={Trophy}
                entries={results.competitions}
                onNavigate={handleNavigate}
              />
              <ResultGroup
                label="Teams"
                icon={Users}
                entries={results.teams}
                onNavigate={handleNavigate}
              />
              <ResultGroup
                label="Players"
                icon={User}
                entries={results.players}
                onNavigate={handleNavigate}
              />
            </>
          )}

          {/* Hint when no query */}
          {!debouncedQuery && !loading && !results && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Search size={24} strokeWidth={1.75} className="text-muted" />
              <p className="text-sm text-secondary">
                Search for competitions, teams, or players
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({
  label,
  icon: Icon,
  entries,
  onNavigate,
}: {
  label: string;
  icon: typeof Trophy;
  entries: SearchIndexEntry[];
  onNavigate: (route: string) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-1">
      <div className="flex items-center gap-2 px-2 pb-1 pt-2">
        <Icon size={14} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
        <span className="text-xs font-medium uppercase tracking-wider text-secondary">
          {label}
        </span>
      </div>
      {entries.map((entry) => (
        <SearchResultRow key={`${entry.type}-${entry.id}`} entry={entry} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function SearchResultRow({
  entry,
  onNavigate,
}: {
  entry: SearchIndexEntry;
  onNavigate: (route: string) => void;
}) {
  return (
    <Link
      href={entry.route}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(entry.route);
      }}
      className="flex min-h-[44px] items-center gap-3 rounded px-2 py-1.5 text-primary outline-none transition-colors hover:bg-surface-raised focus-visible:ring-2 focus-visible:ring-floodlight/40"
      role="option"
      aria-selected={false}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center">
        {entry.type === "player" ? (
          <PlayerAvatar name={entry.name} teamAccent="#F5B942" size={28} />
        ) : (
          <Crest src={entry.imageUrl} alt={`${entry.name} crest`} size={28} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary">{entry.name}</p>
        {entry.context && (
          <p className="truncate text-xs text-secondary">{entry.context}</p>
        )}
      </div>
    </Link>
  );
}
