"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Droplets, Sparkles } from "lucide-react";
import { useUiStore } from "@/stores";

const TONE_ICON = {
  green: <CheckCircle2 className="h-5 w-5 text-primary" />,
  blue: <Droplets className="h-5 w-5 text-blue" />,
  purple: <Sparkles className="h-5 w-5 text-purple" />,
};

export function Toasts() {
  const toasts = useUiStore((s) => s.toasts);
  return (
    <div className="frame-fixed pointer-events-none top-3 z-[70] flex flex-col items-center gap-2 px-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-auto flex w-full max-w-[320px] items-center gap-3 rounded-2xl border border-border/70 bg-elevated/95 px-3.5 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md"
          >
            {TONE_ICON[t.tone]}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{t.title}</p>
              {t.description && <p className="truncate text-xs text-sub">{t.description}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
