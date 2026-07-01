"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sheet({
  children,
  open,
  title,
  onClose,
}: {
  children: ReactNode;
  open: boolean;
  title: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-base/70 backdrop-blur-sm">
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 max-h-sheet overflow-auto rounded-t-md border border-hairline bg-surface p-4",
          "md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close sheet">
            <X size={18} strokeWidth={1.75} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
