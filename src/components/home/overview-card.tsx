"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import { clamp, dayKey, fa } from "@/lib/format";
import { dayTotals, useBodyStore, useNutritionStore, useProfileStore } from "@/stores";
import type { FoodLogEntry } from "@/lib/types";

const NO_ENTRIES: FoodLogEntry[] = [];

export function useDailyProgress() {
  const calorieGoal = useProfileStore((s) => s.goals.dailyCalories);
  const waterGoal = useProfileStore((s) => s.goals.dailyWaterGlasses);
  const stepsGoal = useProfileStore((s) => s.goals.dailySteps);
  // macro goals — runtime fallbacks keep old persisted profiles (pre-v2) working
  const proteinGoal = useProfileStore((s) => s.goals.dailyProtein ?? 150);
  const carbsGoal = useProfileStore((s) => s.goals.dailyCarbs ?? 250);
  const sugarGoal = useProfileStore((s) => s.goals.dailySugar ?? 40);
  const key = dayKey();
  const water = useNutritionStore((s) => s.water[key] ?? 0);
  const logs = useNutritionStore((s) => s.logs[key] ?? NO_ENTRIES);
  const steps = useBodyStore((s) => s.steps[key] ?? 0);
  const activities = useBodyStore((s) => s.activities);
  const mood = useBodyStore((s) => s.moods.find((m) => m.date === key));
  const sleep = useBodyStore((s) => s.sleeps.find((x) => x.date === key));

  const totals = dayTotals(logs); // calories, protein, carbs, sugar, fat
  const burned = activities
    .filter((a) => a.date === key)
    .reduce((t, a) => t + a.calories, 0);
  const activityGoal = Math.max(1, Math.round(calorieGoal * 0.15));

  const score =
    0.3 * clamp(waterGoal ? water / waterGoal : 0, 0, 1) +
    0.3 * clamp(calorieGoal ? totals.calories / calorieGoal : 0, 0, 1) +
    0.2 * clamp(stepsGoal ? steps / stepsGoal : 0, 0, 1) +
    0.2 * (mood || sleep ? 1 : 0);

  return {
    score: Math.round(score * 100),
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    sugar: totals.sugar,
    fat: totals.fat,
    burned,
    activityGoal,
    water,
    steps,
    calorieGoal,
    proteinGoal,
    carbsGoal,
    sugarGoal,
    waterGoal,
    stepsGoal,
  };
}

// --- گیج (نیم‌دایره) با قابلیت پر شدن ---
const GAUGE = { w: 110, h: 55, stroke: 8, r: 46, cx: 55, cy: 55 } as const;

function CalorieGauge({ progress }: { progress: number }) {
  const reduce = useReducedMotion();
  const { w, h, stroke, r, cx, cy } = GAUGE;

  const p = clamp(progress, 0, 1);
  const circumference = 2 * Math.PI * r;
  const halfCircumference = circumference / 2;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: w, height: h }}
    >
      <svg
        className="absolute top-0 left-0 rotate-180"
        width={w}
        height={w}
        viewBox={`0 0 ${w} ${w}`}
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#23262b"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${halfCircumference} ${circumference}`}
        />

        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#ff5c5c"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${halfCircumference} ${circumference}`}
          initial={false}
          animate={{ strokeDashoffset: halfCircumference * (1 - p) }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }
          }
        />
      </svg>

      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 text-[#ff5c5c] flex justify-center items-center bg-[#16181c] rounded-full z-10">
        <Flame className="w-full h-full" strokeWidth={2.2} />
      </div>
    </div>
  );
}

/** Small dynamic macro bar — fills from the right (RTL) based on goal progress */
function MacroBar({
  icon,
  color,
  progress,
}: {
  icon: ReactNode;
  color: string;
  progress: number; // 0..1
}) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="w-4 h-4 flex justify-center items-center" style={{ color }}>
        {icon}
      </div>
      <div className="flex-1 h-1.5 bg-[#23262b] rounded-full overflow-hidden relative">
        <motion.div
          className="absolute right-0 top-0 h-full rounded-full"
          initial={false}
          animate={{ width: `${Math.round(progress * 100)}%` }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 20 }}
          style={{ background: color, boxShadow: `0 0 8px ${color}55` }}
        />
      </div>
    </div>
  );
}

export function CalorieCard() {
  const { calories, burned, protein, carbs, sugar, calorieGoal, proteinGoal, carbsGoal, sugarGoal } =
    useDailyProgress();

  // Math.max(0, ...) باعث می‌شود عدد کالری هیچ‌وقت منفی نشود
  const remaining = Math.max(0, calorieGoal - calories);
  const over = remaining < 0;

  const progress = clamp(calories / Math.max(1, calorieGoal), 0, 1);

  return (
    <div className="w-full max-w-[360px] mx-auto mt-4 flex flex-col gap-3 font-sans text-white">
      <div className="bg-[#16181c] rounded-[28px] px-5 pt-6 pb-0 border border-white/[0.03] relative overflow-hidden">
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#8b8e98] text-[12px] font-medium">
              کالری باقی‌مانده
            </span>
            <AnimatedNumber
              value={remaining}
              className={cx(
                "text-[42px] font-extrabold leading-none tracking-[-1px]",
                over ? "text-[#ff5c5c]" : "text-white",
              )}
            />
          </div>
          <CalorieGauge progress={progress} />
        </div>

        <div className="w-full h-[1px] bg-white/[0.04] mb-4"></div>

        {/* آمار */}
        <div className="flex justify-between items-center px-2 mb-5">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[#7a7d85] text-[11px]">هدف</span>
            <span className="text-[13px] font-bold text-[#00d287] flex items-center gap-1">
              {fa(calorieGoal)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[#7a7d85] text-[11px]">سوزانده</span>
            <span className="text-[13px] font-bold text-[#e2e2e2] flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full bg-[#ff9500]"></span>{" "}
              {fa(burned)}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[#7a7d85] text-[11px]">دریافتی</span>
            <span className="text-[13px] font-bold text-[#e2e2e2] flex items-center gap-1">
              <span className="w-[6px] h-[6px] rounded-full bg-[#3b82f6]"></span>{" "}
              {fa(calories)}
            </span>
          </div>
        </div>

      {/* نوارهای ماکرو — داینامیک بر اساس غذاهای امروز */}
      <div className="bg-[#111215] -mx-5 px-5 py-4 flex flex-col items-center gap-3.5 border-t border-white/[0.02]">
        <div className="flex justify-between items-center w-full gap-3">
          {/* پروتئین (بنفش) */}
          <MacroBar
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            }
            color="#b072ff"
            progress={clamp(protein / Math.max(1, proteinGoal), 0, 1)}
          />

          {/* کربوهیدرات (زرد) */}
          <MacroBar
            icon={
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <circle cx="9" cy="9" r="2" />
                <circle cx="15" cy="9" r="2" />
                <circle cx="9" cy="15" r="2" />
                <circle cx="15" cy="15" r="2" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            }
            color="#ffdb40"
            progress={clamp(carbs / Math.max(1, carbsGoal), 0, 1)}
          />

          {/* قند (صورتی) */}
          <MacroBar
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
              </svg>
            }
            color="#ff5c8a"
            progress={clamp(sugar / Math.max(1, sugarGoal), 0, 1)}
          />
        </div>
        {/* خط کوچک وسط */}
        <div className="w-7 h-[3px] bg-[#2d3036] rounded-full mt-0.5"></div>
      </div>
      </div>
    </div>
  );
}
