"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  isFavorited: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
  size?: number;
};

export function FavoriteButton({
  isFavorited,
  onToggle,
  disabled = false,
  className,
  size = 20,
}: FavoriteButtonProps) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          "inline-flex items-center justify-center rounded p-1.5 text-muted opacity-40 cursor-not-allowed",
          className,
        )}
        title="Sign in to favorite"
        aria-label="Favorite (sign in required)"
      >
        <Star size={size} strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      whileTap={{ scale: 1.3 }}
      transition={{ duration: 0.25, type: "spring", stiffness: 500 }}
      className={cn(
        "inline-flex items-center justify-center rounded p-1.5 transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-floodlight/40",
        isFavorited
          ? "text-floodlight hover:text-floodlight/80"
          : "text-secondary hover:text-primary",
        className,
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
    >
      <Star
        size={size}
        strokeWidth={1.75}
        fill={isFavorited ? "currentColor" : "none"}
      />
    </motion.button>
  );
}
