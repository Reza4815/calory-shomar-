"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Flame, Beef, Wheat, Candy } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import { clamp, dayKey, fa } from "@/lib/format";
import { useBodyStore, useNutritionStore, useProfileStore } from "@/stores";
import type { FoodLogEntry } from "@/lib/types";
import { useState } from "react";

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
        className="absolute top-0 left-0 rotate-180 z-10"
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
          style={{
            filter: `drop-shadow(0 0 6px rgba(255, 92, 92, 0.6)) drop-shadow(0 0 12px rgba(255, 92, 92, ${0.3 + p * 0.3}))`,
          }}
        />
      </svg>

      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 text-[#ff5c5c] flex justify-center items-center z-20"
        style={{
          filter: "drop-shadow(0 0 8px rgba(255, 92, 92, 0.5))",
        }}
      >
        <Flame className="w-full h-full" strokeWidth={2.2} />
      </div>
    </div>
  );
}

export function CalorieCard() {
  const { calories, burned, calorieGoal, protein, carbs, sugar } =
    useDailyProgress();

  const remaining = Math.max(0, calorieGoal - calories);
  const over = calorieGoal - calories < 0;
  const progress = clamp(calories / Math.max(1, calorieGoal), 0, 1);

  const proteinGoal = 150;
  const carbsGoal = 250;
  const sugarGoal = 50;

  const proteinPct = Math.min(100, (protein / proteinGoal) * 100);
  const carbsPct = Math.min(100, (carbs / carbsGoal) * 100);
  const sugarPct = Math.min(100, (sugar / sugarGoal) * 100);

  const [activeCard, setActiveCard] = useState(0);

  return (
    <div className="w-full mt-4 flex flex-col font-sans text-white items-center relative">
      {/* کانتینر کارت‌ها */}
      <div className="relative w-full h-[220px] overflow-hidden rounded-[32px] z-10">
        <AnimatePresence initial={false} mode="wait">
          {/* اسلاید اول (کارت شیشه‌ای اصلی) */}
          {activeCard === 0 && (
            <motion.div
              key="card-1"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(e, info) => {
                if (info.offset.x < -50 || info.velocity.x < -300) {
                  setActiveCard(1);
                }
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full bg-white/[0.02] backdrop-blur-md border border-white/[0.1] rounded-[32px] flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-grab active:cursor-grabbing"
            >
              <div className="bg-transparent rounded-b-[20px] px-5 pt-6 pb-5 h-full flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col items-start gap-1 ml-4">
                    <span className="text-white/60 text-[12px] font-medium">
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

                <div>
                  <div className="w-full h-[1px] bg-white/[0.08] mb-4"></div>
                  <div className="flex justify-between items-center px-2 mt-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-white/50 text-[11px]">دریافتی</span>
                      <span className="text-[13px] font-bold text-[#3b82f6] tnum flex items-center gap-1.5">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#3b82f6]"></span>
                        {fa(calories)}
                      </span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-white/50 text-[11px]">سوزانده</span>
                      <span className="text-[13px] font-bold text-[#ff9500] tnum flex items-center gap-1.5">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#ff9500]"></span>
                        {fa(burned)}
                      </span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-white/50 text-[11px]">هدف</span>
                      <span className="text-[13px] font-bold text-[#00d287] tnum flex items-center gap-1.5">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#00d287]"></span>
                        {fa(calorieGoal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* اسلاید دوم (شیشه‌ای و هماهنگ) */}
          {activeCard === 1 && (
            <motion.div
              key="card-2"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(e, info) => {
                if (info.offset.x > 50 || info.velocity.x > 300) {
                  setActiveCard(0);
                }
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full bg-white/[0.02] backdrop-blur-md border border-white/[0.1] rounded-[32px] flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-grab active:cursor-grabbing overflow-hidden"
            >
              <div className="relative z-10 h-full flex flex-col justify-between px-6 py-6">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center backdrop-blur-md">
                    <Flame className="w-5 h-5 text-[#00d287]" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/40 mb-0.5">
                      هدف روزانه
                    </span>
                    <span className="text-[13px] font-bold text-white tnum">
                      {fa(calorieGoal)}{" "}
                      <span className="text-[9px] text-white/40">kcal</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center mt-2">
                  <span className="text-[11px] font-medium text-white/40 tracking-widest uppercase mb-1">
                    Remaining
                  </span>
                  <div className="flex items-baseline gap-1">
                    <AnimatedNumber
                      value={remaining}
                      className="text-[48px] font-black leading-none tracking-tighter text-white"
                    />
                    <span className="text-[14px] font-bold text-[#00d287]">
                      kcal
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-white/50">
                      دریافتی: {fa(calories)}
                    </span>
                    <span className="text-[10px] text-[#00d287] font-bold">
                      {fa(Math.round(progress * 100))}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-[#00d287] to-[#128a5f] rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* کپسول ماکروها */}
      <div className="relative w-[85%] max-w-[340px] mt-4 z-20">
        <div className="absolute inset-0 flex justify-between pointer-events-none px-2">
          <div className="w-1/3 h-full bg-[#ff7a7a] blur-[32px] opacity-20 rounded-full translate-y-2"></div>
          <div className="w-1/3 h-full bg-[#ffdb40] blur-[32px] opacity-20 rounded-full translate-y-2"></div>
          <div className="w-1/3 h-full bg-[#b072ff] blur-[32px] opacity-20 rounded-full translate-y-2"></div>
        </div>

        <div className="relative w-full bg-white/[0.02] backdrop-blur-md border border-white/[0.1] rounded-[24px] px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-between gap-3">
          {/* پروتئین */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Beef className="w-3 h-3 text-[#ff7a7a]" />
                <span className="text-[9px] font-medium text-[#ff7a7a]">
                  پروتئین
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-white tnum">
                {fa(protein)}
                <span className="text-[8px] text-white/50 font-normal">g</span>
              </span>
            </div>
            <div className="h-[3px] w-full bg-white/[0.05] rounded-full overflow-hidden relative">
              <div
                className="absolute right-0 top-0 h-full bg-[#ff7a7a] rounded-full"
                style={{ width: `${proteinPct}%` }}
              ></div>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-white/[0.06]"></div>

          {/* کربوهیدرات */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Wheat className="w-3 h-3 text-[#ffdb40]" />
                <span className="text-[9px] font-medium text-[#ffdb40]">
                  کربوهیدرات
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-white tnum">
                {fa(carbs)}
                <span className="text-[8px] text-white/50 font-normal">g</span>
              </span>
            </div>
            <div className="h-[3px] w-full bg-white/[0.05] rounded-full overflow-hidden relative">
              <div
                className="absolute right-0 top-0 h-full bg-[#ffdb40] rounded-full"
                style={{ width: `${carbsPct}%` }}
              ></div>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-white/[0.06]"></div>

          {/* قند */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Candy className="w-3 h-3 text-[#b072ff]" />
                <span className="text-[9px] font-medium text-[#b072ff]">
                  قند
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-white tnum">
                {fa(sugar)}
                <span className="text-[8px] text-white/50 font-normal">g</span>
              </span>
            </div>
            <div className="h-[3px] w-full bg-white/[0.05] rounded-full overflow-hidden relative">
              <div
                className="absolute right-0 top-0 h-full bg-[#b072ff] rounded-full"
                style={{ width: `${sugarPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* نقطه‌های داینامیک (ترتیب اصلاح شده) */}
      <div className="flex justify-center items-center gap-1.5 mt-3 z-20">
        {/* نقطه سمت راست (اسلاید 2) */}
        <button
          onClick={() => setActiveCard(1)}
          className={cx(
            "h-1.5 rounded-full transition-all duration-300",
            activeCard === 1 ? "w-4 bg-[#00d287]" : "w-1.5 bg-[#2d3036]",
          )}
        />
        {/* نقطه سمت چپ (اسلاید 1) */}
        <button
          onClick={() => setActiveCard(0)}
          className={cx(
            "h-1.5 rounded-full transition-all duration-300",
            activeCard === 0 ? "w-4 bg-[#00d287]" : "w-1.5 bg-[#2d3036]",
          )}
        />
      </div>
    </div>
  );
}
