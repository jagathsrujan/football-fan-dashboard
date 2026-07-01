import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  message: string;
  action?: { label: string; onClick: () => void };
  variant?: "empty" | "error";
};

export function EmptyState({ action, icon: Icon, message, variant = "empty" }: EmptyStateProps) {
  const DisplayIcon = variant === "error" ? AlertTriangle : Icon;

  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 rounded-md border border-hairline bg-surface p-6 text-center",
        variant === "error" && "border-loss/60",
      )}
    >
      <DisplayIcon className={cn("h-8 w-8", variant === "error" ? "text-loss" : "text-floodlight")} strokeWidth={1.75} />
      <p className="max-w-sm text-sm text-secondary">{message}</p>
      {action && (
        <button
          className="inline-flex h-9 items-center justify-center rounded border border-hairline bg-surface-raised px-3 text-sm font-semibold text-primary outline-none transition-colors hover:border-floodlight/40 focus-visible:ring-2 focus-visible:ring-floodlight/40"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
