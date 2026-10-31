"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Droplet,
  Footprints,
  Leaf,
  Plus,
  Minus,
  Scale,
  HeartPulse,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  IconBadge,
  ProgressBar,
  ProgressRing,
  RoundButton,
} from "@/components/ui/primitives";
import { useDailyProgress } from "@/components/home/overview-card";
import { UNIT_LABEL, toUnit, useWaterToday } from "@/components/water-controls";
import { cx } from "@/lib/cx";
import { clamp, dayKey, fa, round1 } from "@/lib/format";
import {
  toast,
  useBodyStore,
  useNutritionStore,
  useProfileStore,
} from "@/stores";

const ratio = (value: number, goal: number) =>
  clamp(goal > 0 ? value / goal : 0, 0, 1);

export function StatusSection() {
  const { water, waterGoal, steps, stepsGoal, burned, activityGoal } =
    useDailyProgress();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const reduce = useReducedMotion();

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setPage(Math.round(Math.abs(el.scrollLeft) / Math.max(1, el.clientWidth)));
  };

  const goTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: i * el.clientWidth,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const rows = [
    {
      id: "water",
      icon: <Droplet className="h-3.5 w-3.5" />,
      color: "#9B78E8",
      progress: ratio(water, waterGoal),
    },
    {
      id: "steps",
      icon: <Footprints className="h-3.5 w-3.5" />,
      color: "#F2A94B",
      progress: ratio(steps, stepsGoal),
    },
    {
      id: "activity",
      icon: <Activity className="h-3.5 w-3.5" />,
      color: "#F16B68",
      progress: ratio(burned, activityGoal),
    },
  ];

  return (
    <section className="mt-2">
      <div
        ref={scrollRef}
        dir="ltr"
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[20px]"
      >
        <div dir="rtl" className="w-[94%] mx-auto shrink-0 snap-center">
          <div
            className="relative overflow-hidden rounded-[20px] px-4 py-3.5"
            style={{
              background: "#111215",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            <div className="relative space-y-3">
              {rows.map((row) => (
                <div key={row.id} className="flex items-center gap-2.5">
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
                    style={{ color: row.color }}
                    aria-hidden
                  >
                    {row.icon}
                  </span>
                  <ProgressBar
                    progress={row.progress}
                    color={row.color}
                    height={4}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div dir="rtl" className="w-[94%] mx-auto shrink-0 snap-center">
          <div
            className="relative overflow-hidden rounded-[20px] px-4 py-3.5 flex justify-around items-center"
            style={{
              background: "#111215",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            <div className="text-center">
              <span className="text-[10px] text-[#8b8e98]">آب</span>
              <div className="text-[13px] font-bold text-[#9B78E8]">
                {fa(water)}
              </div>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-[#8b8e98]">قدم</span>
              <div className="text-[13px] font-bold text-[#F2A94B]">
                {fa(steps)}
              </div>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-[#8b8e98]">سوزانده</span>
              <div className="text-[13px] font-bold text-[#F16B68]">
                {fa(burned)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {[0, 1].map((i) => {
          const active = page === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cx(
                "transition-all duration-300",
                active
                  ? "w-4 h-1 bg-[#00D69A] rounded-full"
                  : "w-1.5 h-1.5 bg-[#3A4150] rounded-full",
              )}
            />
          );
        })}
      </div>
    </section>
  );
}

export function KaraCard() {
  const router = useRouter();
  const mealsLogged = useNutritionStore((s) => (s.logs[dayKey()] ?? []).length);
  const message =
    mealsLogged === 0
      ? {
          m: "اولین وعده‌تون رو ثبت کنین",
          d: "با ثبت غذاهای امروز، کالری و مواد مغذی هر وعده رو شفاف ببینین.",
        }
      : {
          m: "وعده‌های بعدی رو هم ثبت کنین",
          d: "هر وعده‌ای که ثبت کنین، تصویر بهتری از انرژی امروزتون به دست میارین.",
        };

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <IconBadge
            icon={<Leaf className="h-4 w-4" />}
            tone="green"
            size={40}
          />
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
        </div>
        <div>
          <h3 className="text-[14px] font-extrabold">کارا</h3>
          <p className="text-[10px] text-sub">مربی هوشمند کاهش</p>
        </div>
      </div>
      <div className="mt-3 rounded-xl rounded-tr-sm border border-border/50 bg-surface px-3 py-2.5">
        <p className="text-[12px] font-bold">{message.m}</p>
        <p className="mt-1 text-[10px] leading-4 text-sub">{message.d}</p>
      </div>
    </Card>
  );
}

const WATER_ACCENT = "#A78BFA";

export function WaterCard() {
  const { glasses, unit, goal } = useWaterToday();
  const addWater = useNutritionStore((s) => s.addWater);
  const display = toUnit(glasses, unit);
  const displayGoal = toUnit(goal, unit);
  const complete = glasses >= goal && glasses > 0;

  const bump = (delta: number) => {
    if (glasses + delta < 0) return;
    addWater(delta);
    if (delta > 0 && glasses + delta >= goal && glasses < goal)
      toast({ title: "آفرین! به هدف آب امروز رسیدی", tone: "purple" });
  };

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-white/[0.03] bg-[#16181c] p-4 mt-4"
    >
      <div className="relative flex items-center gap-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{
            background: "rgba(167, 139, 250, 0.14)",
            color: WATER_ACCENT,
          }}
        >
          <Droplet
            className="h-4 w-4"
            strokeWidth={2.2}
            fill={WATER_ACCENT}
            fillOpacity={0.25}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold">آب‌شمار</h3>
          <p className="text-[10px] text-sub">پیشرفت آب امروز</p>
        </div>
        <RoundButton
          tone="purple"
          size={34}
          label="افزودن آب"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => bump(1)}
        />
      </div>
      <div className="relative mt-3">
        <div className="mb-1.5 flex items-center justify-between text-[10px]">
          <span className="text-sub">
            {fa(display, 1)} از {fa(displayGoal, 1)} {UNIT_LABEL[unit]}
          </span>
          <span className="font-semibold tnum" style={{ color: WATER_ACCENT }}>
            {complete
              ? "هدف کامل شد"
              : `${fa(toUnit(Math.max(0, round1(goal - glasses)), unit), 1)} ${UNIT_LABEL[unit]} تا هدف`}
          </span>
        </div>
        <ProgressBar
          progress={goal > 0 ? glasses / goal : 0}
          color={WATER_ACCENT}
          height={6}
        />
      </div>
      <div className="relative mt-2 flex justify-start">
        <RoundButton
          tone="outline"
          size={28}
          label="کم کردن آب"
          icon={<Minus className="h-3.5 w-3.5" />}
          onClick={() => bump(-1)}
        />
      </div>
    </section>
  );
}

export function WeightCard() {
  const router = useRouter();
  const weights = useBodyStore((s) => s.weights);
  const goals = useProfileStore((s) => s.goals);
  const status = useProfileStore((s) => s.weightStatus);
  const setStatus = useProfileStore((s) => s.setWeightStatus);

  const latest = weights.length > 0 ? weights[weights.length - 1] : undefined;
  const current = latest?.kg ?? goals.startWeightKg;
  const total = Math.max(0.1, goals.startWeightKg - goals.targetWeightKg);
  const done = clamp((goals.startWeightKg - current) / total, 0, 1);
  const remaining = Math.max(
    0,
    Math.round((current - goals.targetWeightKg) * 10) / 10,
  );

  return (
    <Card
      className="relative mt-4 overflow-hidden p-4"
      onClick={() => router.push("/weight")}
    >
      <div className="relative">
        <div className="flex items-center gap-3">
          <IconBadge
            icon={<Scale className="h-4 w-4" />}
            tone="green"
            size={38}
          />
          <div className="flex-1">
            <h3 className="text-[14px] font-bold">پیشرفت وزن</h3>
            <p className="text-[10px] text-sub">آخرین وضعیت وزن</p>
          </div>
          <span className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-surface text-sub">
            <ChevronLeft className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[28px] font-extrabold leading-none tnum">
              {fa(current, 1)}{" "}
              <span className="text-[11px] font-semibold text-sub">کیلو</span>
            </p>
            <p className="mt-1 text-[10px] text-muted">وزن فعلی</p>
          </div>
          <select
            aria-label="وضعیت وزن"
            value={status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              setStatus(e.target.value as "کاهش" | "ثابت" | "افزایش")
            }
            className="rounded-full border border-border/70 bg-surface px-2.5 py-1.5 text-[10px] font-semibold text-sub outline-none focus:border-primary/60"
          >
            <option value="کاهش">در حال کاهش</option>
            <option value="ثابت">ثابت</option>
            <option value="افزایش">در حال افزایش</option>
          </select>
        </div>
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="text-sub">
              هدف: {fa(goals.targetWeightKg, 1)} کیلو
            </span>
            <span className="font-semibold text-primary tnum">
              {remaining > 0
                ? `${fa(remaining, 1)} کیلو تا هدف`
                : "به هدف رسیدی"}
            </span>
          </div>
          <ProgressBar progress={done} height={6} />
        </div>
      </div>
    </Card>
  );
}

const MOOD_LABELS = ["", "بد", "بی‌حال", "معمولی", "خوب", "عالی"];

export function LowerCards() {
  const router = useRouter();
  const stepsGoal = useProfileStore((s) => s.goals.dailySteps);
  const steps = useBodyStore((s) => s.steps[dayKey()] ?? 0);
  const moodRec = useBodyStore((s) => s.moods.find((m) => m.date === dayKey()));

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Card
        className="flex flex-col items-center p-3"
        onClick={() => router.push("/activity")}
      >
        <ProgressRing
          size={70}
          stroke={6}
          progress={stepsGoal ? steps / stepsGoal : 0}
          color="#F2A94B"
        >
          <Footprints className="h-4 w-4 text-orange" />
        </ProgressRing>
        <h3 className="mt-2 text-[12px] font-bold">قدم‌های من</h3>
        {steps > 0 ? (
          <>
            <p className="mt-0.5 text-[12px] font-extrabold tnum text-orange">
              {fa(steps)} قدم
            </p>
            <p className="text-[9px] text-muted">هدف {fa(stepsGoal)}</p>
          </>
        ) : (
          <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-blue">
            اتصال به سلامتی
            <ChevronLeft className="h-2.5 w-2.5" />
          </p>
        )}
      </Card>
      <Card
        className="flex flex-col items-center p-3"
        onClick={() => router.push("/mood")}
      >
        <ProgressRing
          size={70}
          stroke={6}
          progress={moodRec ? moodRec.mood / 5 : 0}
          color="#F16B68"
        >
          {moodRec ? (
            <HeartPulse className="h-4 w-4 text-red" />
          ) : (
            <Plus className="h-5 w-5 text-primary" strokeWidth={2.6} />
          )}
        </ProgressRing>
        <h3 className="mt-2 text-[12px] font-bold">حال من</h3>
        {moodRec ? (
          <>
            <p className="mt-0.5 text-[12px] font-extrabold text-red">
              {MOOD_LABELS[moodRec.mood]}
            </p>
            <p className="text-[9px] text-muted">امروز ثبت شد</p>
          </>
        ) : (
          <p className="mt-1 text-[10px] font-semibold text-sub">
            حال امروز رو وارد کن
          </p>
        )}
      </Card>
    </div>
  );
}
