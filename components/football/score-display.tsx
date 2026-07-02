"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import type { MatchStatus } from "@/components/football/types";

type ScoreDisplayProps = {
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
};

function Digit({ value }: { value: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className="relative inline-grid h-12 min-w-10 place-items-center overflow-hidden rounded bg-surface-raised px-2 font-display text-4xl font-bold tabular-nums shadow-inner">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={shouldReduceMotion ? { opacity: 1 } : { rotateX: 90, y: -20, opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { rotateX: -90, y: 20, opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: ease.flip }}
          className="block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function ScoreDisplay({ awayScore, homeScore, status }: ScoreDisplayProps) {
  const scheduled = status === "SCHEDULED" || status === "POSTPONED" || status === "CANCELLED";
  const home = scheduled || homeScore === null ? "–" : String(homeScore);
  const away = scheduled || awayScore === null ? "–" : String(awayScore);

  const shouldReduceMotion = useReducedMotion();
  const [flashing, setFlashing] = useState(false);
  const prevScores = useRef<{ home: string; away: string } | null>(null);

  useEffect(() => {
    if (prevScores.current === null) {
      prevScores.current = { home, away };
      return;
    }

    if (prevScores.current.home !== home || prevScores.current.away !== away) {
      prevScores.current = { home, away };
      setFlashing(true);
      const timer = setTimeout(() => setFlashing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [home, away]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 rounded-lg p-2 text-primary transition-colors duration-700",
        flashing && !shouldReduceMotion ? "bg-amber-500/30 ring-2 ring-amber-500/50" : "bg-transparent",
      )}
      aria-label={`Score ${home} to ${away}`}
    >
      <Digit value={home} />
      <span className="font-display text-3xl font-bold text-secondary">:</span>
      <Digit value={away} />
    </div>
  );
}
