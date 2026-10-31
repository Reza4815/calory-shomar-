"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Apple,
  ChefHat,
  Coffee,
  Dumbbell,
  Droplet,
  HeartPulse,
  History,
  Moon,
  Plus,
  Scale,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Portal } from "@/components/ui/portal";
import { WaterControls } from "@/components/water-controls";

interface Action {
  label: string;
  icon: ReactNode;
  color: string;
  bg: string;
  onTap: () => void;
}

export function FabMenu() {
  const [open, setOpen] = useState(false);
  const [waterOpen, setWaterOpen] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (href: string) => () => {
    setOpen(false);
    router.push(href);
  };

  const actions: Action[] = [
    { label: "خواب", icon: <Moon className="h-[22px] w-[22px]" />, color: "#9B78E8", bg: "rgba(155,120,232,0.16)", onTap: go("/sleep") },
    { label: "میان‌وعده", icon: <Apple className="h-[22px] w-[22px]" />, color: "#F2A94B", bg: "rgba(242,169,75,0.15)", onTap: go("/food?meal=snack") },
    { label: "ناهار", icon: <UtensilsCrossed className="h-[22px] w-[22px]" />, color: "#20C98A", bg: "rgba(32,201,138,0.14)", onTap: go("/food?meal=lunch") },
    { label: "صبحانه", icon: <Coffee className="h-[22px] w-[22px]" />, color: "#F2A94B", bg: "rgba(242,169,75,0.15)", onTap: go("/food?meal=breakfast") },
    { label: "حال من", icon: <HeartPulse className="h-[22px] w-[22px]" />, color: "#F16B68", bg: "rgba(241,107,104,0.15)", onTap: go("/mood") },
    { label: "وزن", icon: <Scale className="h-[22px] w-[22px]" />, color: "#20C98A", bg: "rgba(32,201,138,0.14)", onTap: go("/weight") },
    { label: "آب", icon: <Droplet className="h-[22px] w-[22px]" />, color: "#5599F2", bg: "rgba(85,153,242,0.14)", onTap: () => { setOpen(false); setWaterOpen(true); } },
    { label: "فعالیت", icon: <Dumbbell className="h-[22px] w-[22px]" />, color: "#F2A94B", bg: "rgba(242,169,75,0.15)", onTap: go("/activity") },
    { label: "آشپزخانه من", icon: <ChefHat className="h-[22px] w-[22px]" />, color: "#9B78E8", bg: "rgba(155,120,232,0.16)", onTap: go("/kitchen") },
    { label: "امروز من", icon: <History className="h-[22px] w-[22px]" />, color: "#9BA3AE", bg: "rgba(155,163,174,0.12)", onTap: go("/today") },
  ];

  return (
    <>
      {/* Floating action button — physical right of the nav capsule (first in RTL row) */}
      <motion.button
        type="button"
        aria-label="ثبت سریع"
        onClick={() => setOpen(true)}
        whileTap={reduce ? undefined : { scale: 0.88 }}
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-[#05130D] shadow-[0_8px_26px_rgba(32,201,138,0.45),0_0_44px_rgba(32,201,138,0.18)]"
      >
        <Plus className="h-7 w-7" strokeWidth={2.6} />
      </motion.button>

      {/* dialog + sheet are portaled to <body> — inside .frame-fixed (transformed
          bottom nav), `position: fixed` is relative to the nav strip and the
          overlay gets clipped to ~80px at the bottom of the screen */}
      <Portal>
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
            <motion.button
              aria-label="بستن منو"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-[#05080C]/80 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />

            <div className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain">
              <div className="relative mx-auto flex min-h-full w-full max-w-[430px] flex-col items-center justify-center px-6" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)" }}>
                <motion.h2
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.3 }}
                  className="text-[26px] font-extrabold"
                >
                  چی ثبت کنیم؟
                </motion.h2>
                <motion.p
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mt-1.5 text-sm text-sub"
                >
                  مورد غذایی یا فعالیت امروزت رو انتخاب کن
                </motion.p>

                <div className="mt-9 grid w-full max-w-[340px] grid-cols-4 gap-x-1.5 gap-y-6">
                  {actions.map((a, i) => (
                    <motion.button
                      key={a.label}
                      type="button"
                      onClick={a.onTap}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 14 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
                      transition={{ type: "spring", stiffness: 380, damping: 26, delay: reduce ? 0 : 0.06 + i * 0.035 }}
                      whileTap={reduce ? undefined : { scale: 0.9 }}
                      className="flex w-16 flex-col items-center gap-2 justify-self-center"
                    >
                      <span
                        className="grid h-16 w-16 place-items-center rounded-full border border-white/5"
                        style={{ background: a.bg, color: a.color, boxShadow: `0 0 18px ${a.color}22` }}
                      >
                        {a.icon}
                      </span>
                      <span className="text-[11px] font-semibold leading-none text-sub">{a.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 36px)" }}>
              <motion.button
                type="button"
                aria-label="بستن"
                onClick={() => setOpen(false)}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: reduce ? 0 : 0.18 }}
                whileTap={{ scale: 0.88 }}
                className="pointer-events-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-[#05130D] ring-1 ring-primary/40 shadow-[0_10px_30px_rgba(32,201,138,0.5),0_0_60px_rgba(32,201,138,0.28)]"
              >
                <X className="h-7 w-7" strokeWidth={2.6} />
              </motion.button>
            </div>
          </div>
        )}
        </AnimatePresence>
      </Portal>

      <Portal>
        <Sheet open={waterOpen} onClose={() => setWaterOpen(false)} title="آب‌شمار" subtitle="آبی که امروز نوشیدی رو ثبت کن">
          <WaterControls />
        </Sheet>
      </Portal>
    </>
  );
}
