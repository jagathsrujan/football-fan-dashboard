import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  variant?: "neutral" | "live" | "win" | "draw" | "loss" | "info";
} & HTMLAttributes<HTMLSpanElement>;

const variants = {
  neutral: "bg-surface-raised text-secondary",
  live: "bg-live text-primary",
  win: "bg-win text-primary",
  draw: "bg-draw text-base",
  loss: "bg-loss text-primary",
  info: "bg-dusk text-primary",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-medium uppercase tracking-wider",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
