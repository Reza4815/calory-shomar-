"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Plus, Utensils } from "lucide-react";
import Link from "next/link";
import { HomeHeader } from "@/components/home/home-header";
import {
  KaraCard,
  LowerCards,
  WeightCard,
} from "@/components/home/status-section";
import { CalorieCard } from "@/components/home/overview-card";
import { TasksCard } from "@/components/home/tasks-card";
import { PageBody, SectionTitle } from "@/components/ui/primitives";
import { useNutritionStore } from "@/stores";
import { dayKey, fa } from "@/lib/format";
import { MEAL_LABELS, type FoodLogEntry } from "@/lib/types";

const NO_ENTRIES: FoodLogEntry[] = [];

export default function HomePage() {
  // لاگ غذاهای امروز از استور
  const key = dayKey();
  const logs = useNutritionStore((s) => s.logs[key] ?? NO_ENTRIES);
  const removeFoodEntry = useNutritionStore((s) => s.removeFoodEntry);

  return (
    <PageBody>
      <HomeHeader />

      {/* کارت کالری */}
      <CalorieCard />

      {/* کارت شروع سریع */}
      <TasksCard />

      {/* --- بخش: لیست وعده‌های امروز --- */}
      <div className="mt-6 w-full max-w-[360px] mx-auto">
        <div className="flex items-center justify-between px-2 mb-3">
          <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#00d287]" />
            وعده‌های امروز
          </h2>
          <Link
            href="/meals"
            className="flex items-center gap-1 text-[11px] font-semibold text-[#00d287] hover:underline"
          >
            مشاهده همه
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#16181c] rounded-[28px] p-4 border border-white/[0.03] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8b8e98]">
              {fa(logs.length)} مورد ثبت شده برای امروز
            </span>
            <Link
              href="/food"
              aria-label="افزودن غذا"
              className="flex items-center gap-1 rounded-full bg-[#00d287]/15 px-3 py-1.5 text-[11px] font-bold text-[#00d287] transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.6} />
              افزودن
            </Link>
          </div>

          {logs.length === 0 ? (
            // اگر هیچ غذایی ثبت نشده بود:
            <div className="text-center py-6 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#1c1e23] flex items-center justify-center mb-2">
                <Utensils className="w-5 h-5 text-[#8b8e98]" />
              </div>
              <p className="text-[13px] text-[#8b8e98]">
                هنوز غذایی برای امروز ثبت نکردی.
              </p>
              <Link
                href="/food"
                className="text-[12px] font-bold text-[#00d287] mt-1 hover:underline"
              >
                ثبت اولین وعده
              </Link>
            </div>
          ) : (
            // اگر غذا ثبت شده بود، لیست می‌شود:
            <ul className="flex flex-col">
              <AnimatePresence initial={false}>
                {logs.map((food) => (
                  <motion.li
                    key={food.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1c1e23] border border-white/[0.02]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-white">
                          {food.name}
                        </span>
                        <span className="text-[10px] text-[#8b8e98]">
                          {MEAL_LABELS[food.meal]} • {fa(food.calories)} کالری
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* دکمه حذف غذا */}
                        <button
                          type="button"
                          aria-label={`حذف ${food.name}`}
                          onClick={() => removeFoodEntry(key, food.id)}
                          className="w-7 h-7 rounded-full bg-[#2d3036] flex items-center justify-center text-[#ff5c5c] hover:bg-[#ff5c5c]/20 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* بقیه بخش‌های داشبورد */}
      <div className="mt-8">
        <SectionTitle title="وضعیت امروز" badge="فعال" />
        <KaraCard />
      </div>

      <div className="mt-5">
        <WeightCard />
      </div>

      <LowerCards />
    </PageBody>
  );
}
