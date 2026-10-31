"use client";

import { motion } from "framer-motion";
import { Bell, ChevronLeft, CircleHelp, Plus, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { FoodSheet } from "@/components/food/food-sheet";
import { foodIcon } from "@/components/food/food-icon";
import { ScreenHeader, HeaderSpacer } from "@/components/shell/screen-header";
import { EmptyState, PageBody, Segmented } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/sheet";
import { fa } from "@/lib/format";
import { toast } from "@/stores";
import { useNutritionStore } from "@/stores";
import { MEAL_LABELS, type FoodItem, type MealType } from "@/lib/types";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "صبحانه" },
  { value: "lunch", label: "ناهار" },
  { value: "snack", label: "میان‌وعده" },
  { value: "dinner", label: "شام" },
];

function MacroPill({ value, unit, color }: { value: number; unit: string; color: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold tnum"
      style={{ color, background: `${color}1F` }}
    >
      {fa(value)} {unit}
    </span>
  );
}

export function FoodClient({ initialMeal }: { initialMeal: MealType }) {
  const [meal, setMeal] = useState<MealType>(initialMeal);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const foods = useNutritionStore((s) => s.foods);
  const logs = useNutritionStore((s) => s.logs);
  const today = new Date();
  const dayKeyStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayMealCount = (logs[dayKeyStr] ?? []).filter((e) => e.meal === meal).length;

  const list = useMemo(() => {
    const q = query.trim();
    return foods.filter((f) => {
      const inMeal = f.meals.includes(meal) || f.custom;
      const match = !q || f.name.includes(q);
      return inMeal && match;
    });
  }, [foods, meal, query]);

  return (
    <>
      <ScreenHeader
        title={`افزودن ${MEAL_LABELS[meal]}`}
        subtitle="غذای موردنظرت رو پیدا و ثبت کن"
        end={
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="اعلان‌ها"
              onClick={() => toast({ title: "اعلان جدیدی نداری", description: "همه‌چیز به‌روز است", tone: "purple" })}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card text-sub"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <button
              type="button"
              aria-label="راهنما"
              onClick={() => setHelpOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-card text-sub"
            >
              <CircleHelp className="h-[18px] w-[18px]" />
            </button>
          </div>
        }
      />
      <HeaderSpacer />

      <PageBody className="pt-4">
        <Segmented id="meal" options={MEAL_OPTIONS} value={meal} onChange={setMeal} />

        {/* search */}
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-border/60 bg-surface px-4 py-3.5 focus-within:border-primary/60">
          <Search className="h-[18px] w-[18px] shrink-0 text-primary" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setTimeout(() => inputRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }), 250);
            }}
            placeholder="جستجوی غذا"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {todayMealCount > 0 && (
          <p className="mt-3 text-[11px] text-sub">
            امروز {fa(todayMealCount)} مورد برای {MEAL_LABELS[meal]} ثبت کرده‌ای
          </p>
        )}

        {/* list */}
        <div className="mt-4 space-y-2.5">
          {list.map((f, i) => (
            <motion.button
              key={f.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setSelected(f)}
              className="flex w-full items-center gap-3 rounded-[20px] border border-border/60 bg-card p-3.5 text-right"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/12 text-primary">
                {foodIcon(f.tag, 19)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold">{f.name}</span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <MacroPill value={f.calories} unit="کالری" color="#F2A94B" />
                  <MacroPill value={f.protein} unit="پ" color="#F16B68" />
                  <MacroPill value={f.carbs} unit="ک" color="#E8C15A" />
                  <MacroPill value={f.fat} unit="چ" color="#9B78E8" />
                </span>
              </span>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted" />
            </motion.button>
          ))}

          {list.length === 0 && (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="غذایی پیدا نشد"
              hint="عبارت دیگری را جستجو کن یا غذای خودت را بساز"
            />
          )}
        </div>

        <Link
          href="/kitchen"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 py-3.5 text-xs font-semibold text-sub transition-colors active:text-text"
        >
          <Plus className="h-4 w-4 text-primary" />
          غذای دلخواهت لیست نشده؟ از آشپزخانه من اضافه کن
        </Link>
      </PageBody>

      {selected && <FoodSheet food={selected} meal={meal} onClose={() => setSelected(null)} />}

      <Sheet open={helpOpen} onClose={() => setHelpOpen(false)} title="راهنمای ثبت غذا">
        <ul className="space-y-3 text-[13px] leading-6 text-sub">
          <li className="flex gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            نوع وعده را از بالای صفحه انتخاب کن (صبحانه، ناهار، میان‌وعده یا شام).
          </li>
          <li className="flex gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            نام غذا را جستجو کن و روی آن بزن تا مقدار و واحد را مشخص کنی.
          </li>
          <li className="flex gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            مقادیر تغذیه‌ای تقریبی هستند و با دستور پخت تو ممکن است فرق کنند.
          </li>
          <li className="flex gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            غذاهای دلخواهت را از «آشپزخانه من» اضافه کن تا اینجا هم دیده شوند.
          </li>
        </ul>
      </Sheet>
    </>
  );
}
