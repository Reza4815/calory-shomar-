"use client";

import { Minus, Plus } from "lucide-react";
import { ProgressBar, RoundButton, Segmented } from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import { dayKey, fa, round1 } from "@/lib/format";
import { toast, useNutritionStore, useProfileStore } from "@/stores";
import type { WaterUnit } from "@/lib/types";

const UNIT_STEP: Record<WaterUnit, number> = { glass: 1, bottle: 2, liter: 4 };
export const UNIT_LABEL: Record<WaterUnit, string> = { glass: "لیوان", bottle: "بطری", liter: "لیتر" };
const UNIT_DIVISOR: Record<WaterUnit, number> = { glass: 1, bottle: 2, liter: 4 };

export function useWaterToday() {
  const glasses = useNutritionStore((s) => s.water[dayKey()] ?? 0);
  const unit = useNutritionStore((s) => s.waterUnit);
  const goal = useProfileStore((s) => s.goals.dailyWaterGlasses);
  return { glasses, unit, goal };
}

export function toUnit(glasses: number, unit: WaterUnit): number {
  return round1(glasses / UNIT_DIVISOR[unit]);
}

export function WaterControls({
  className,
  accent = "#5599F2",
  accentTone,
}: {
  className?: string;
  /** Main accent color (bar / buttons / unit switch) */
  accent?: string;
  /** Filled round-button tone; "purple" when accent is purple */
  accentTone?: "blue" | "purple";
}) {
  const { glasses, unit, goal } = useWaterToday();
  const setWaterUnit = useNutritionStore((s) => s.setWaterUnit);
  const addWater = useNutritionStore((s) => s.addWater);

  const step = UNIT_STEP[unit];
  const display = toUnit(glasses, unit);
  const displayGoal = toUnit(goal, unit);
  const remaining = Math.max(0, round1(goal - glasses));
  const tone = accentTone ?? "blue";

  const bump = (delta: number) => {
    if (glasses + delta < 0) return;
    addWater(delta);
    if (delta > 0 && glasses + delta >= goal && glasses < goal) {
      toast({ title: "آفرین! به هدف آب امروز رسیدی", tone: tone === "purple" ? "purple" : "blue" });
    }
  };

  return (
    <div className={cx(className)}>
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-[26px] font-extrabold leading-none tnum">
            <span>{fa(display, 1)}</span>{" "}
            <span className="text-sm font-semibold text-sub">از {fa(displayGoal, 1)} {UNIT_LABEL[unit]}</span>
          </p>
          <p className="mt-1.5 text-xs text-sub">
            {remaining > 0 ? `${fa(toUnit(remaining, unit), 1)} ${UNIT_LABEL[unit]} تا هدف` : "هدف امروز کامل شد"}
          </p>
        </div>
      </div>

      <ProgressBar progress={goal > 0 ? glasses / goal : 0} color={accent} className="mb-4" height={7} />

      {/* DOM order [plus … minus] → plus renders physically right, minus physically left in RTL */}
      <div className="flex items-center justify-center gap-7">
        <RoundButton
          tone={tone}
          size={52}
          label="اضافه کردن آب"
          icon={<Plus className="h-6 w-6" />}
          onClick={() => bump(step)}
        />
        <div className="w-24 text-center">
          <p className="text-xs text-muted">{UNIT_LABEL[unit]} امروز</p>
          <p className="text-xl font-extrabold tnum" style={{ color: accent }}>
            {fa(display, 1)}
          </p>
        </div>
        <RoundButton
          tone="outline"
          size={52}
          label="کم کردن آب"
          icon={<Minus className="h-5 w-5" />}
          onClick={() => bump(-step)}
        />
      </div>

      <Segmented
        id="water-unit"
        className="mt-4"
        accent={accent}
        value={unit}
        onChange={(v) => setWaterUnit(v)}
        options={[
          { value: "glass", label: "لیوان" },
          { value: "bottle", label: "بطری" },
          { value: "liter", label: "لیتر" },
        ]}
      />
    </div>
  );
}
