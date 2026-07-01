"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion-tokens";
import type { MatchStatus } from "@/components/football/types";

type ScoreDisplayProps = {
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
};

function Digit({ value }: { value: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className="relative inline-grid h-12 min-w-10 place-items-center overflow-hidden rounded bg-surface-raised px-2 font-display text-4xl font-bold tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={shouldReduceMotion ? { opacity: 1 } : { y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: ease.flip }}
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

  return (
    <div className="flex items-center justify-center gap-3 text-primary" aria-label={`Score ${home} to ${away}`}>
      <Digit value={home} />
      <span className="font-display text-3xl font-bold text-secondary">:</span>
      <Digit value={away} />
    </div>
  );
}
