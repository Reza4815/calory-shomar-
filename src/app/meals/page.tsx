"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Apple,
  Coffee,
  Flame,
  Plus,
  Soup,
  Trash2,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import { Card, IconBadge, PageBody } from "@/components/ui/primitives";
import { clamp, dayKey, fa, faFullDate, faTime } from "@/lib/format";
import { MEAL_LABELS, MEAL_ORDER, type FoodLogEntry, type MealType } from "@/lib/types";
import { dayTotals, useNutritionStore, useProfileStore } from "@/stores";

const NO_ENTRIES: FoodLogEntry[] = [];

/* Macro accent colors — same palette as the calorie card macro bars */
const MACRO_COLORS = {
  protein: "#b072ff",
  carbs: "#ffdb40",
  sugar: "#ff5c8a",
  calories: "#f2a94b",
} as const;

const MEAL_META: Record<MealType, { icon: LucideIcon; tone: "green" | "orange" | "blue" | "purple" }> = {
  breakfast: { icon: Coffee, tone: "orange" },
  lunch: { icon: UtensilsCrossed, tone: "green" },
  snack: { icon: Apple, tone: "blue" },
  dinner: { icon: Soup, tone: "purple" },
};

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold tnum"
      style={{ color, background: `${color}1F` }}
    >
      {label} {fa(value)}
    </span>
  );
}

function MealRow({ entry, dateKey }: { entry: FoodLogEntry; dateKey: string }) {
  const removeFoodEntry = useNutritionStore((s) => s.removeFoodEntry);
  const reduce = useReducedMotion();

  return (
    <motion.li
      layout
      key={entry.id}
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{entry.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5">
            <MacroPill label="" value={entry.calories} color={MACRO_COLORS.calories} />
            <MacroPill label="پ" value={entry.protein} color={MACRO_COLORS.protein} />
            <MacroPill label="ک" value={entry.carbs} color={MACRO_COLORS.carbs} />
            <MacroPill label="قند" value={entry.sugar ?? 0} color={MACRO_COLORS.sugar} />
            <span className="text-[9.5px] text-muted tnum">{faTime(entry.time)}</span>
          </p>
        </div>

        {/* حذف مورد */}
        <button
          type="button"
          aria-label={`حذف ${entry.name}`}
          onClick={() => removeFoodEntry(dateKey, entry.id)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sub transition-colors hover:bg-[#ff5c5c]/15 hover:text-[#ff5c5c]"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.li>
  );
}

function MealSection({
  meal,
  entries,
  dateKey,
}: {
  meal: MealType;
  entries: FoodLogEntry[];
  dateKey: string;
}) {
  const kcal = entries.reduce((a, e) => a + e.calories, 0);
  const { icon: Icon, tone } = MEAL_META[meal];

  return (
    <Card className="p-4">
      {/* سربرگ وعده */}
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconBadge
            icon={<Icon className="h-[18px] w-[18px]" />}
            tone={tone}
            size={40}
            iconSize={18}
          />
          <div>
            <h3 className="text-[14px] font-bold">{MEAL_LABELS[meal]}</h3>
            <p className="mt-0.5 text-[10.5px] text-sub tnum">
              {entries.length > 0
                ? `${fa(entries.length)} مورد · ${fa(kcal)} کالری`
                : "هنوز چیزی ثبت نشده"}
            </p>
          </div>
        </div>

        {/* افزودن غذا به همین وعده — FoodSheet با وعده از پیش انتخاب‌شده */}
        <Link
          href={`/food?meal=${meal}`}
          aria-label={`افزودن غذا به ${MEAL_LABELS[meal]}`}
          className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-2 text-[11.5px] font-bold text-primary transition-transform active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.6} />
          افزودن
        </Link>
      </div>

      {/* لیست غذاها */}
      {entries.length > 0 ? (
        <ul className="divide-y divide-white/[0.03]">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <MealRow key={e.id} entry={e} dateKey={dateKey} />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="mt-3 rounded-2xl bg-white/[0.02] px-3 py-3 text-center text-[11px] text-muted">
          با دکمه «افزودن» اولین غذای این وعده رو ثبت کن
        </p>
      )}
    </Card>
  );
}

function SummaryCard({ children }: { children: ReactNode }) {
  return <Card glow="green" className="flex items-center gap-4 p-5">{children}</Card>;
}

export default function MealsPage() {
  const key = dayKey();

  const entries = useNutritionStore((s) => s.logs[key] ?? NO_ENTRIES);
  const dailyCalories = useProfileStore((s) => s.goals.dailyCalories);

  const totals = useMemo(() => dayTotals(entries), [entries]);
  const remaining = Math.max(0, dailyCalories - totals.calories);
  const progress = clamp(totals.calories / Math.max(1, dailyCalories), 0, 1);

  return (
    <>
      <ScreenHeader
        title="وعده‌های امروز"
        subtitle={faFullDate()}
      />
      <HeaderSpacer />

      <PageBody className="pt-4">
        {/* خلاصه روز */}
        <SummaryCard>
          <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/[0.04]">
            <Flame className="h-6 w-6 text-[#ff5c5c]" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-bold">کالری امروز</h2>
            <p className="mt-1 text-[12px] font-extrabold tnum">
              <span className="text-primary">{fa(totals.calories)}</span>
              <span className="text-sub"> از {fa(dailyCalories)} کالری</span>
            </p>
            <p className="mt-0.5 text-[10.5px] text-sub tnum">
              {remaining > 0 ? `${fa(remaining)} کالری باقی‌مانده` : "هدف کالری امروز کامل شد"}
            </p>
          </div>
          <span className="shrink-0 text-[12px] font-extrabold text-primary tnum">
            {fa(Math.round(progress * 100))}٪
          </span>
        </SummaryCard>

        {/* بخش هر وعده */}
        <div className="mt-4 space-y-3.5">
          {MEAL_ORDER.map((meal) => (
            <MealSection
              key={meal}
              meal={meal}
              entries={entries.filter((e) => e.meal === meal)}
              dateKey={key}
            />
          ))}
        </div>
      </PageBody>
    </>
  );
}
