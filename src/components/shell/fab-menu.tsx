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

const ACTIONS: Omit<Action, "onTap">[] = [
  {
    label: "خواب",
    icon: <Moon className="h-[22px] w-[22px]" />,
    color: "#9B78E8",
    bg: "rgba(155,120,232,0.16)",
  },
  {
    label: "میان‌وعده",
    icon: <Apple className="h-[22px] w-[22px]" />,
    color: "#F2A94B",
    bg: "rgba(242,169,75,0.15)",
  },
  {
    label: "ناهار",
    icon: <UtensilsCrossed className="h-[22px] w-[22px]" />,
    color: "#20C98A",
    bg: "rgba(32,201,138,0.14)",
  },
  {
    label: "صبحانه",
    icon: <Coffee className="h-[22px] w-[22px]" />,
    color: "#F2A94B",
    bg: "rgba(242,169,75,0.15)",
  },
  {
    label: "حال من",
    icon: <HeartPulse className="h-[22px] w-[22px]" />,
    color: "#F16B68",
    bg: "rgba(241,107,104,0.15)",
  },
  {
    label: "وزن",
    icon: <Scale className="h-[22px] w-[22px]" />,
    color: "#20C98A",
    bg: "rgba(32,201,138,0.14)",
  },
  {
    label: "آب",
    icon: <Droplet className="h-[22px] w-[22px]" />,
    color: "#5599F2",
    bg: "rgba(85,153,242,0.14)",
  },
  {
    label: "فعالیت",
    icon: <Dumbbell className="h-[22px] w-[22px]" />,
    color: "#F2A94B",
    bg: "rgba(242,169,75,0.15)",
  },
  {
    label: "آشپزخانه من",
    icon: <ChefHat className="h-[22px] w-[22px]" />,
    color: "#9B78E8",
    bg: "rgba(155,120,232,0.16)",
  },
  {
    label: "امروز من",
    icon: <History className="h-[22px] w-[22px]" />,
    color: "#9BA3AE",
    bg: "rgba(155,163,174,0.12)",
  },
];

export function FabMenu() {
  const [open, setOpen] = useState(false);
  const [waterOpen, setWaterOpen] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();

  const close = () => setOpen(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
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
    close();
    // زمان کمی صبر می‌کنیم تا انیمیشن خروج منو اجرا شود، بعد صفحه عوض شود
    setTimeout(() => router.push(href), 150);
  };

  const actions: Action[] = [
    { ...ACTIONS[0], onTap: go("/sleep") },
    { ...ACTIONS[1], onTap: go("/food?meal=snack") },
    { ...ACTIONS[2], onTap: go("/food?meal=lunch") },
    { ...ACTIONS[3], onTap: go("/food?meal=breakfast") },
    { ...ACTIONS[4], onTap: go("/mood") },
    { ...ACTIONS[5], onTap: go("/weight") },
    {
      ...ACTIONS[6],
      onTap: () => {
        close();
        setWaterOpen(true);
      },
    },
    { ...ACTIONS[7], onTap: go("/activity") },
    { ...ACTIONS[8], onTap: go("/kitchen") },
    { ...ACTIONS[9], onTap: go("/today") },
  ];

  return (
    <>
      <motion.button
        type="button"
        aria-label="ثبت سریع"
        onClick={() => setOpen(true)}
        whileTap={reduce ? undefined : { scale: 0.88 }}
        className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-[#05130D] shadow-[0_8px_26px_rgba(32,201,138,0.45),0_0_44px_rgba(32,201,138,0.18)]"
      >
        <Plus className="h-7 w-7" strokeWidth={2.6} />
      </motion.button>

      <Portal>
        <AnimatePresence>
          {open && (
            <div
              className="fixed inset-0 z-[60]"
              role="dialog"
              aria-modal="true"
            >
              {/* بک‌گراند با انیمیشن محو شدن سریع */}
              <motion.button
                aria-label="بستن منو"
                onClick={close}
                className="absolute inset-0 cursor-default bg-[#05080C]/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />

              <div className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain">
                <div
                  className="relative mx-auto flex min-h-full w-full max-w-[430px] flex-col items-center justify-center px-6"
                  style={{
                    paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
                    paddingBottom:
                      "calc(env(safe-area-inset-bottom, 0px) + 40px)",
                  }}
                >
                  <motion.h2
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.15 }}
                    className="text-[26px] font-extrabold"
                  >
                    چی ثبت کنیم؟
                  </motion.h2>

                  <motion.p
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ delay: 0.03, duration: 0.15 }}
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
                        initial={
                          reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          // اینجا هیچ تاخیری (delay) نداریم تا فریز نشه
                          transition: { duration: 0.12 },
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 32,
                          delay: reduce ? 0 : 0.02 + i * 0.018,
                        }}
                        whileTap={reduce ? undefined : { scale: 0.9 }}
                        className="flex w-16 flex-col items-center gap-2 justify-self-center"
                      >
                        <span
                          className="grid h-16 w-16 place-items-center rounded-full border border-white/5"
                          style={{ background: a.bg, color: a.color }}
                        >
                          {a.icon}
                        </span>
                        <span className="text-[11px] font-semibold leading-none text-sub">
                          {a.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
                style={{
                  paddingBottom:
                    "calc(env(safe-area-inset-bottom, 0px) + 36px)",
                }}
              >
                <motion.button
                  type="button"
                  aria-label="بستن"
                  onClick={close}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.7,
                    transition: { duration: 0.12 },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    delay: reduce ? 0 : 0.1,
                  }}
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
        <Sheet
          open={waterOpen}
          onClose={() => setWaterOpen(false)}
          title="آب‌شماری"
          subtitle="آب که امروز نوشیدی رو ثبت کن"
        >
          <WaterControls />
        </Sheet>
      </Portal>
    </>
  );
}
