import { Badge } from "@/components/ui/badge";

export function LiveBadge() {
  return (
    <Badge variant="live">
      <span className="relative h-2 w-2 rounded-full bg-primary">
        <span className="absolute inset-0 rounded-full bg-primary motion-safe:animate-live-pulse" />
      </span>
      LIVE
    </Badge>
  );
}
