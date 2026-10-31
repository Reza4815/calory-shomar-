"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end">
          <motion.button
            aria-label="بستن"
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className={cx(
              "relative flex max-h-[86dvh] w-full max-w-[430px] flex-col overflow-hidden",
              "rounded-t-[28px] border border-b-0 border-border/80 bg-elevated"
            )}
          >
            <div className="mx-auto mt-2.5 h-1.5 w-11 shrink-0 rounded-full bg-border" />
            <div className="flex items-center justify-between px-5 pb-2 pt-3">
              <div>
                {title && <h3 className="text-lg font-bold">{title}</h3>}
                {subtitle && <p className="mt-0.5 text-xs text-sub">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="بستن پنجره"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/70 bg-card text-sub transition-colors hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-9 pt-1 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
