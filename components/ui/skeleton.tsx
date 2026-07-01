import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative overflow-hidden rounded bg-surface-raised", className)} {...props}>
      <div className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-floodlight/10 to-transparent motion-safe:animate-skeleton-shimmer" />
    </div>
  );
}

export function SkeletonStack() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
