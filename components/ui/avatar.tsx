import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AvatarProps = {
  label: string;
  size?: "sm" | "md" | "lg";
} & HTMLAttributes<HTMLDivElement>;

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

function initials(label: string) {
  const parts = label.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export function Avatar({ className, label, size = "md", ...props }: AvatarProps) {
  return (
    <div
      aria-label={label}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-hairline bg-surface-raised font-display font-semibold text-primary",
        sizes[size],
        className,
      )}
      {...props}
    >
      {initials(label)}
    </div>
  );
}
