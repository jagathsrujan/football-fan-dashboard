"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function Tabs({ tabs, defaultValue }: { tabs: Tab[]; defaultValue?: string }) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto border-b border-hairline" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "relative h-11 whitespace-nowrap text-sm font-semibold text-secondary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-floodlight/40",
              active === tab.id && "text-primary",
            )}
            onClick={() => setActive(tab.id)}
            role="tab"
            type="button"
            aria-selected={active === tab.id}
          >
            {tab.label}
            {active === tab.id && (
              <motion.span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-floodlight"
                layoutId="tab-underline"
                transition={{ duration: 0.22 }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="pt-4" role="tabpanel">
        {tabs.find((tab) => tab.id === active)?.content}
      </div>
    </div>
  );
}
