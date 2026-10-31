"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Footprints,
  GlassWater,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { IconBadge, ProgressRing, type Tone } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/sheet";
import { WaterControls } from "@/components/water-controls";
import { cx } from "@/lib/cx";
import { dayKey, fa } from "@/lib/format";
import { useBodyStore, useNutritionStore } from "@/stores";
import type { FoodLogEntry } from "@/lib/types";

const NO_ENTRIES: FoodLogEntry[] = [];

interface Task {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
  icon: ReactNode;
  tone: Tone;
  run: () => void;
}

export function TasksCard() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [waterOpen, setWaterOpen] = useState(false);
  const reduce = useReducedMotion();

  const logs = useNutritionStore((s) => s.logs[dayKey()] ?? NO_ENTRIES);
  const water = useNutritionStore((s) => s.water[dayKey()] ?? 0);
  const steps = useBodyStore((s) => s.steps[dayKey()] ?? 0);

  const tasks: Task[] = [
    {
      id: "t1",
      title: "ثبت وعده",
      subtitle: "غذایی که خوردی رو وارد کن",
      done: logs.length > 0,
      icon: <UtensilsCrossed className="h-4 w-4" />,
      tone: "green",
      run: () => router.push("/food"),
    },
    {
      id: "t2",
      title: "اتصال قدم‌شمار",
      subtitle: "ثبت خودکار قدم‌ها",
      done: steps > 0,
      icon: <Footprints className="h-4 w-4" />,
      tone: "orange",
      run: () => router.push("/activity"),
    },
    {
      id: "t3",
      title: "ثبت آب",
      subtitle: "حتی یک لیوان هم حساب میشه",
      done: water > 0,
      icon: <GlassWater className="h-4 w-4" />,
      tone: "blue",
      run: () => setWaterOpen(true),
    },
  ];

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <>
      {/* عرض به w-full تغییر کرد */}
      <div className="bg-[#16181c] rounded-[28px] px-5 pt-6 pb-5 border border-white/[0.03] w-full mt-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <ProgressRing
              size={42}
              stroke={5}
              progress={doneCount / tasks.length}
              color="#00d287"
            >
              <span className="text-[11px] font-bold tnum text-white">
                {fa(doneCount)}/{fa(tasks.length)}
              </span>
            </ProgressRing>
            <div className="text-right">
              <h3 className="text-[15px] font-extrabold leading-snug text-white">
                شروع سریع
              </h3>
              <p className="mt-0.5 text-[11px] text-[#8b8e98]">
                ۳ کار ساده برای امروز
              </p>
            </div>
          </div>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#23262b] text-[#8b8e98]"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2.5">
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={t.run}
                    className="flex w-full items-center gap-3 rounded-2xl bg-[#1c1e23] p-3.5 text-right border border-white/[0.02]"
                  >
                    <IconBadge icon={t.icon} tone={t.tone} size={36} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cx(
                          "text-[13px] font-bold leading-snug text-white",
                          t.done && "text-[#8b8e98] line-through",
                        )}
                      >
                        {t.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#8b8e98]">
                        {t.subtitle}
                      </p>
                    </div>
                    <span
                      className={cx(
                        "relative grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                        t.done
                          ? "border-[#00d287] bg-[#00d287]"
                          : "border-[#3b82f6] bg-transparent",
                      )}
                    >
                      {t.done && (
                        <Check
                          className="h-3.5 w-3.5 text-[#05130D]"
                          strokeWidth={3.5}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Sheet
        open={waterOpen}
        onClose={() => setWaterOpen(false)}
        title="آب‌شمار"
        subtitle="آبی که امروز نوشیدی رو ثبت کن"
      >
        <WaterControls />
      </Sheet>
    </>
  );
}
