"use client";

import {
  Droplets,
  Flame,
  Footprints,
  GlassWater,
  HeartPulse,
  History,
  Moon,
  Plus,
  Scale,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDailyProgress } from "@/components/home/overview-card";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import {
  Card,
  EmptyState,
  IconBadge,
  PageBody,
  ProgressRing,
} from "@/components/ui/primitives";
import { dayKey, fa, faFullDate, faTime } from "@/lib/format";
import { MEAL_LABELS, MEAL_ORDER, type FoodLogEntry } from "@/lib/types";
import { useBodyStore, useNutritionStore } from "@/stores";

const NO_ENTRIES: FoodLogEntry[] = [];

const MOOD_LABELS = ["", "دلگیر", "بی‌حال", "معمولی", "خوب", "عالی"];

function QuickRow({
  href,
  icon,
  tone,
  title,
  value,
}: {
  href: string;
  icon: React.ReactNode;
  tone: Parameters<typeof IconBadge>[0]["tone"];
  title: string;
  value: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 py-3">
      <IconBadge icon={icon} tone={tone} size={40} />
      <span className="flex-1 text-[13px] font-bold">{title}</span>
      <span className="text-[12.5px] font-extrabold text-sub tnum">
        {value}
      </span>
    </Link>
  );
}

export default function TodayPage() {
  const router = useRouter();
  const key = dayKey();
  const { score } = useDailyProgress();
  const entries = useNutritionStore((s) => s.logs[key] ?? NO_ENTRIES);
  const removeFoodEntry = useNutritionStore((s) => s.removeFoodEntry);
  const addWater = useNutritionStore((s) => s.addWater);
  const water = useNutritionStore((s) => s.water[key] ?? 0);
  const steps = useBodyStore((s) => s.steps[key] ?? 0);
  const mood = useBodyStore((s) => s.moods.find((m) => m.date === key));
  const sleep =
    useBodyStore((s) => s.sleeps.find((x) => x.date === key)) ??
    useBodyStore((s) => s.sleeps[s.sleeps.length - 1]);
  const weights = useBodyStore((s) => s.weights);
  const latestWeight = weights[weights.length - 1];

  const totals = entries.reduce(
    (a, e) => ({
      calories: a.calories + e.calories,
      protein: a.protein + e.protein,
      carbs: a.carbs + e.carbs,
      fat: a.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <>
      <PageBody className="pt-5">
        <ScreenHeader title="امروز من" subtitle={faFullDate()} />
        {/* score summary */}
        <Card glow="green" className="flex items-center gap-4 p-5">
          <ProgressRing size={76} stroke={8} progress={score / 100}>
            <span className="text-sm font-extrabold tnum">{fa(score)}٪</span>
          </ProgressRing>
          <div className="flex-1">
            <h2 className="text-[15px] font-bold">خلاصه امروز</h2>
            <p className="mt-1 text-[11.5px] leading-5 text-sub">
              {fa(entries.length)} مورد غذایی · {fa(totals.calories)} کالری ·{" "}
              {fa(water)} لیوان آب · {fa(steps)} قدم
            </p>
          </div>
        </Card>

        {/* quick stats */}
        <Card className="mt-4 divide-y divide-border/40 px-5 py-1.5">
          <QuickRow
            href="/weight"
            icon={<Scale className="h-4.5 w-4.5" />}
            tone="green"
            title="آخرین وزن"
            value={latestWeight ? `${fa(latestWeight.kg, 1)} کیلو` : "ثبت نشده"}
          />
          <QuickRow
            href="/sleep"
            icon={<Moon className="h-4.5 w-4.5" />}
            tone="purple"
            title="خواب"
            value={sleep ? `${fa(sleep.hours, 1)} ساعت` : "ثبت نشده"}
          />
          <QuickRow
            href="/mood"
            icon={<HeartPulse className="h-4.5 w-4.5" />}
            tone="red"
            title="حال امروز"
            value={mood ? MOOD_LABELS[mood.mood] : "ثبت نشده"}
          />
          <QuickRow
            href="/activity"
            icon={<Footprints className="h-4.5 w-4.5" />}
            tone="orange"
            title="قدم‌های امروز"
            value={`${fa(steps)} قدم`}
          />
        </Card>

        {/* water quick */}
        <Card className="mt-4 flex items-center gap-3 p-4" glow="blue">
          <IconBadge
            icon={<Droplets className="h-5 w-5" />}
            tone="blue"
            size={44}
          />
          <div className="flex-1">
            <p className="text-[13.5px] font-bold">آب امروز</p>
            <p className="text-[11px] text-sub tnum">
              {fa(water)} لیوان نوشیده شده
            </p>
          </div>
          <button
            type="button"
            aria-label="یک لیوان آب"
            onClick={() => addWater(1)}
            className="grid h-11 w-11 place-items-center rounded-full bg-blue text-[#061018] shadow-[0_6px_18px_rgba(85,153,242,0.35)]"
          >
            <Plus className="h-5 w-5" />
          </button>
        </Card>

        {/* meals */}
        <div className="mb-3 mt-6 flex items-center gap-2">
          <h2 className="text-[15px] font-bold">وعده‌های امروز</h2>
          <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold text-primary tnum">
            {fa(entries.length)} مورد
          </span>
        </div>

        {entries.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={<UtensilsCrossed className="h-6 w-6" />}
              title="هنوز چیزی ثبت نشده"
              hint="با دکمه سبز + اولین وعده‌ات رو ثبت کن"
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {MEAL_ORDER.map((meal) => {
              const list = entries.filter((e) => e.meal === meal);
              if (list.length === 0) return null;
              const kcal = list.reduce((a, e) => a + e.calories, 0);
              return (
                <Card key={meal} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="flex items-center gap-2 text-[13px] font-bold">
                      <GlassWater className="hidden" />
                      {MEAL_LABELS[meal]}
                    </p>
                    <span className="text-[11px] font-bold text-orange tnum">
                      {fa(kcal)} کالری
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {list.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-3 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-semibold">
                            {e.name}
                          </p>
                          <p className="text-[10px] text-muted tnum">
                            {fa(e.grams)} گرم · ساعت {faTime(e.time)} · پ{" "}
                            {fa(e.protein)} / ک {fa(e.carbs)} / چ {fa(e.fat)}
                          </p>
                        </div>
                        <span className="text-[11.5px] font-bold text-orange tnum">
                          {fa(e.calories)}
                        </span>
                        <button
                          type="button"
                          aria-label="حذف مورد"
                          onClick={() => removeFoodEntry(key, e.id)}
                          className="grid h-7 w-7 place-items-center rounded-full text-muted hover:text-red"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* macro totals */}
        {entries.length > 0 && (
          <Card className="mt-4 p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { l: "کالری", v: totals.calories, c: "#F2A94B" },
                { l: "پروتئین", v: totals.protein, c: "#F16B68" },
                { l: "کربوهیدرات", v: totals.carbs, c: "#E8C15A" },
                { l: "چربی", v: totals.fat, c: "#9B78E8" },
              ].map((m) => (
                <div key={m.l} className="rounded-xl bg-surface/70 py-2.5">
                  <p
                    className="text-[14px] font-extrabold tnum"
                    style={{ color: m.c }}
                  >
                    {fa(m.v)}
                  </p>
                  <p className="mt-0.5 text-[9.5px] text-muted">{m.l}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <button
          type="button"
          onClick={() => router.push("/food")}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-[#05130D] shadow-[0_8px_24px_rgba(32,201,138,0.30)]"
        >
          <Flame className="h-4 w-4" />
          ثبت وعده جدید
        </button>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <History className="h-3 w-3" />
          تاریخچه روزهای قبل به‌صورت خودکار ذخیره می‌شود
        </div>
      </PageBody>
    </>
  );
}
