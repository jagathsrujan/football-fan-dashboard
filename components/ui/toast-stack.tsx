"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Goal } from "lucide-react";
import { Crest } from "@/components/football/crest";
import { ease } from "@/lib/motion-tokens";

export type GoalToastPayload = {
  id: string;
  scorer: string;
  teamName: string;
  teamCrest: string | null;
  minute: number;
};

type ToastListener = (toast: GoalToastPayload) => void;
const listeners = new Set<ToastListener>();

export function toastGoal(payload: Omit<GoalToastPayload, "id">) {
  const toast: GoalToastPayload = {
    ...payload,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  listeners.forEach((listener) => listener(toast));
}

export function ToastStack() {
  const [toasts, setToasts] = useState<GoalToastPayload[]>([]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    function handleToast(toast: GoalToastPayload) {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    }
    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none sm:right-6">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!shouldReduceMotion}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.95 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.35, ease: ease.out }}
            className="pointer-events-auto flex items-center gap-3 rounded-lg border border-hairline bg-surface-raised p-3 shadow-xl backdrop-blur"
            role="status"
            aria-live="polite"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-win/10 text-win">
              <Goal size={20} strokeWidth={1.75} />
            </div>
            <Crest src={toast.teamCrest} alt={`${toast.teamName} crest`} size={32} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-win">GOAL! {toast.minute}&apos;</span>
                <span className="truncate text-xs font-medium text-secondary">{toast.teamName}</span>
              </div>
              <p className="truncate text-sm font-semibold text-primary">{toast.scorer}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
