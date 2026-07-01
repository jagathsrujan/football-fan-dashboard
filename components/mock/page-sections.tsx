import { AlertTriangle, CalendarX, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonStack } from "@/components/ui/skeleton";
import { Card, CardTitle } from "@/components/ui/card";

export function PageHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-wider text-secondary">{eyebrow}</p>
      <h1 className="mt-2 font-display text-4xl font-bold">{title}</h1>
    </div>
  );
}

export function FeedbackStates({ emptyMessage }: { emptyMessage: string }) {
  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-3">
      <Card>
        <CardTitle className="mb-4 text-xl">Loading</CardTitle>
        <SkeletonStack />
      </Card>
      <Card>
        <CardTitle className="mb-4 text-xl">Empty</CardTitle>
        <EmptyState icon={CalendarX} message={emptyMessage} />
      </Card>
      <Card>
        <CardTitle className="mb-4 text-xl">Error</CardTitle>
        <EmptyState
          icon={AlertTriangle}
          message="Mock request failed. Retry keeps the same preview state."
          variant="error"
          action={{ label: "Retry", onClick: () => undefined }}
        />
      </Card>
    </section>
  );
}

export function StatGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[
        ["Matches", "18"],
        ["Goals", "42"],
        ["Clean sheets", "7"],
        ["Updated", "Mock"],
      ].map(([label, value]) => (
        <Card key={label}>
          <p className="text-xs font-medium uppercase tracking-wider text-secondary">{label}</p>
          <p className="mt-2 font-display text-4xl font-bold">{value}</p>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-2 rounded-md border border-hairline bg-surface p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

export function MockRefreshButton() {
  return (
    <button className="inline-flex h-9 items-center gap-2 rounded border border-hairline px-3 text-sm text-secondary hover:text-primary" type="button">
      <RefreshCw size={18} strokeWidth={1.75} />
      Mock refresh
    </button>
  );
}
