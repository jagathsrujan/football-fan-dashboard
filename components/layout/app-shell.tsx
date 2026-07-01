"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  Moon,
  Search,
  Star,
  Sun,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SearchOverlay = dynamic(
  () => import("@/components/search/search-overlay").then((m) => m.SearchOverlay),
  { ssr: false },
);

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/competitions", label: "Competitions", icon: Trophy },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/favorites", label: "Favorites", icon: Star },
];

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1] ?? null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setCollapsed(readCookie("sidebar") === "collapsed");
    const savedTheme = readCookie("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `sidebar=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000`;
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `theme=${next}; path=/; max-age=31536000`;
  }

  return (
    <div className="min-h-screen bg-base text-primary">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-hairline bg-surface transition-all duration-200 lg:flex lg:flex-col",
          collapsed ? "w-sidebar-collapsed" : "w-sidebar",
        )}
      >
        <div className="flex h-16 items-center border-b border-hairline px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3 text-primary">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-floodlight font-display text-lg font-bold text-base">
              FD
            </span>
            {!collapsed && <span className="truncate font-display text-xl font-bold">Football Dashboard</span>}
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded border-l-2 border-transparent px-3 text-sm font-medium text-secondary outline-none transition-colors hover:bg-surface-raised hover:text-primary focus-visible:ring-2 focus-visible:ring-floodlight/40",
                  active && "border-floodlight bg-surface-raised text-primary",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} strokeWidth={1.75} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          className="m-3 flex h-9 items-center justify-center rounded border border-hairline text-secondary transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-floodlight/40"
          onClick={toggleSidebar}
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} strokeWidth={1.75} /> : <ChevronLeft size={18} strokeWidth={1.75} />}
        </button>
      </aside>

      <div className={cn("min-h-screen pb-bottom-nav transition-all duration-200 lg:pb-0", collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar")}>
        <header className="sticky top-0 z-20 border-b border-hairline bg-base/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-secondary">Matchday, not spreadsheet</p>
              <div className="font-display text-xl font-bold">Fan Dashboard</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" aria-label="Open search" onClick={() => setSearchOpen(true)}>
                <Search size={20} strokeWidth={1.75} />
                <kbd className="ml-1.5 hidden rounded border border-hairline px-1.5 py-0.5 font-data text-[10px] text-muted lg:inline-block">
                  ⌘K
                </kbd>
              </Button>
              <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-bottom-nav grid-cols-4 border-t border-hairline bg-surface lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs text-secondary outline-none focus-visible:ring-2 focus-visible:ring-floodlight/40",
                active && "text-floodlight",
              )}
            >
              <Icon size={20} strokeWidth={1.75} />
              {active && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </div>
  );
}
