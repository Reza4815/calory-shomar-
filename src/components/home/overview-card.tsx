"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import { clamp, dayKey, fa } from "@/lib/format";
import { useBodyStore, useNutritionStore, useProfileStore } from "@/stores";
import type { FoodLogEntry } from "@/lib/types";
import { useMemo } from "react";

const NO_ENTRIES: FoodLogEntry[] = [];

export function useDailyProgress() {
  const calorieGoal = useProfileStore((s) => s.goals.dailyCalories);
  const waterGoal = useProfileStore((s) => s.goals.dailyWaterGlasses);
  const stepsGoal = useProfileStore((s) => s.goals.dailySteps);
  const key = dayKey();
  const water = useNutritionStore((s) => s.water[key] ?? 0);
  const logs = useNutritionStore((s) => s.logs[key] ?? NO_ENTRIES);
  const steps = useBodyStore((s) => s.steps[key] ?? 0);
  const activities = useBodyStore((s) => s.activities);
  const mood = useBodyStore((s) => s.moods.find((m) => m.date === key));
  const sleep = useBodyStore((s) => s.sleeps.find((x) => x.date === key));

  const calories = logs.reduce((a, e) => a + e.calories, 0);
  const protein = logs.reduce((a, e) => a + e.protein, 0);
  const carbs = logs.reduce((a, e) => a + e.carbs, 0);
  const sugar = logs.reduce((a, e) => a + (e.sugar ?? 0), 0);

  const burned = activities
    .filter((a) => a.date === key)
    .reduce((t, a) => t + a.calories, 0);
  const proteinGoal = Math.max(1, Math.round((calorieGoal * 0.3) / 4));
  const activityGoal = Math.max(1, Math.round(calorieGoal * 0.15));

  const score =
    0.3 * clamp(waterGoal ? water / waterGoal : 0, 0, 1) +
    0.3 * clamp(calorieGoal ? calories / calorieGoal : 0, 0, 1) +
    0.2 * clamp(stepsGoal ? steps / stepsGoal : 0, 0, 1) +
    0.2 * (mood || sleep ? 1 : 0);

  return {
    score: Math.round(score * 100),
    calories,
    protein,
    carbs,
    sugar,
    proteinGoal,
    burned,
    activityGoal,
    water,
    steps,
    calorieGoal,
    waterGoal,
    stepsGoal,
  };
}

// --- گیج (نیم‌دایره‌ای) ---
// سایز بزرگ‌تر شد: w=160, h=80, stroke=12, r=68
const GAUGE = { w: 160, h: 80, stroke: 12, r: 68, cx: 80, cy: 80 } as const;

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
        {/* خط پس‌زمینه */}
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
        {/* خط پیشرفت با Glow */}
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
          style={{
            // گلو قوی‌تر و محسوس‌تر
            filter: `drop-shadow(0 0 6px rgba(255, 92, 92, 0.8)) drop-shadow(0 0 12px rgba(255, 92, 92, ${p * 0.6}))`,
          }}
        />
      </svg>

      {/* آیکون آتش بدون انیمیشن و پایین‌تر */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 text-[#ff5c5c] flex justify-center items-center bg-[#16181c] rounded-full z-10">
        <Flame className="w-full h-full" strokeWidth={2.2} />
      </div>
    </div>
  );
}

export function CalorieCard() {
  const { calories, burned, calorieGoal, protein, carbs, sugar } =
    useDailyProgress();

  const proteinGoal = 150;
  const carbsGoal = 250;
  const sugarGoal = 50;

  const proteinPct = Math.min(100, (protein / proteinGoal) * 100);
  const carbsPct = Math.min(100, (carbs / carbsGoal) * 100);
  const sugarPct = Math.min(100, (sugar / sugarGoal) * 100);

  const remaining = Math.max(0, calorieGoal - calories);
  const over = calorieGoal - calories < 0;
  const progress = clamp(calories / Math.max(1, calorieGoal), 0, 1);

  return (
    <div className="w-full mt-4 flex flex-col font-sans text-white">
      <div className="w-full bg-[#141519] rounded-[28px] border border-white/[0.03] overflow-hidden flex flex-col">
        <div className="bg-[#16181c] rounded-b-[20px] px-5 pt-6 pb-5">
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

          <div className="flex justify-between items-center px-2">
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
        </div>

        <div className="px-4 py-4 flex flex-col items-center gap-3">
          <div className="flex justify-between items-center w-full gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-4 h-4 flex justify-center items-center text-[#ff7a7a]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-full h-full"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div className="flex-1 h-[5px] bg-[#2f2221] rounded-full overflow-hidden relative">
                <div
                  className="absolute right-0 top-0 h-full bg-[#ff7a7a] rounded-full"
                  style={{ width: `${proteinPct}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-4 h-4 flex justify-center items-center text-[#ffdb40]">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <circle cx="9" cy="9" r="2" />
                  <circle cx="15" cy="9" r="2" />
                  <circle cx="9" cy="15" r="2" />
                  <circle cx="15" cy="15" r="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="flex-1 h-[5px] bg-[#2e2a1f] rounded-full overflow-hidden relative">
                <div
                  className="absolute right-0 top-0 h-full bg-[#ffdb40] rounded-full"
                  style={{ width: `${carbsPct}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-4 h-4 flex justify-center items-center text-[#b072ff]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="w-full h-full"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
              </div>
              <div className="flex-1 h-[5px] bg-[#2a2438] rounded-full overflow-hidden relative">
                <div
                  className="absolute right-0 top-0 h-full bg-[#b072ff] rounded-full"
                  style={{ width: `${sugarPct}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="w-6 h-[3px] bg-[#2d3036] rounded-full mt-1"></div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-1.5 mt-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#2d3036]"></div>
        <div className="w-4 h-1.5 rounded-full bg-[#00d287]"></div>
      </div>
    </div>
  );
}
