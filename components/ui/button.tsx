"use client";

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "link";
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variants = {
  primary: "bg-floodlight text-base hover:brightness-110 active:brightness-95",
  secondary: "border border-hairline bg-surface-raised text-primary hover:border-floodlight/40",
  ghost: "bg-transparent text-secondary hover:bg-surface-raised hover:text-primary",
  link: "h-auto bg-transparent p-0 text-floodlight underline-offset-4 hover:underline",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, loading, variant = "secondary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-floodlight/40 disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      <span className={cn(loading && "opacity-80")}>{children}</span>
    </button>
  ),
);

Button.displayName = "Button";
