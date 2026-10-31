"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { IconBadge, PrimaryButton, RoundButton, Segmented } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/sheet";
import { fa, round1 } from "@/lib/format";
import { MEAL_LABELS, type FoodItem, type MealType } from "@/lib/types";
import { toast, useNutritionStore } from "@/stores";
import { foodIcon } from "@/components/food/food-icon";

type QtyUnit = "serving" | "gram";

export function FoodSheet({
  food,
  meal,
  onClose,
}: {
  food: FoodItem | null;
  meal: MealType;
  onClose: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState<QtyUnit>("serving");
  const addFoodEntry = useNutritionStore((s) => s.addFoodEntry);

  const grams = useMemo(() => {
    if (!food) return 0;
    return unit === "serving" ? Math.round(food.grams * qty) : Math.round(qty);
  }, [food, qty, unit]);

  const ratio = food && food.grams > 0 ? grams / food.grams : 0;
  const scale = (v: number) => Math.round(v * ratio);

  const step = unit === "serving" ? 0.5 : 25;
  const bump = (dir: number) => setQty((q) => Math.max(step, round1(q + dir * step)));

  const add = () => {
    if (!food) return;
    addFoodEntry(meal, food, grams);
    toast({ title: "به " + MEAL_LABELS[meal] + " اضافه شد", description: food.name, tone: "green" });
    reset();
    onClose();
  };

  const reset = () => {
    setQty(1);
    setUnit("serving");
  };

  if (!food) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;

  const macros = [
    { label: "کالری", value: `${fa(scale(food.calories))} کالری`, color: "#F2A94B" },
    { label: "پروتئین", value: `${fa(scale(food.protein))} گرم`, color: "#F16B68" },
    { label: "کربوهیدرات", value: `${fa(scale(food.carbs))} گرم`, color: "#E8C15A" },
    { label: "چربی", value: `${fa(scale(food.fat))} گرم`, color: "#9B78E8" },
  ];

  return (
    <Sheet open onClose={() => { reset(); onClose(); }} title={food.name} subtitle={`هر ${food.serving} · ${fa(food.grams)} گرم`}>
      <div className="flex flex-col items-center pt-1">
        <IconBadge icon={foodIcon(food.tag, 30)} tone="green" size={72} />

        {/* macro tiles */}
        <div className="mt-5 grid w-full grid-cols-4 gap-2">
          {macros.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border/50 bg-card px-1.5 py-3 text-center">
              <p className="text-[13px] font-extrabold tnum" style={{ color: m.color }}>
                {m.value.split(" ")[0]}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">{m.label === "کالری" ? "کالری" : `${m.label} (گرم)`}</p>
            </div>
          ))}
        </div>

        {/* quantity */}
        <div className="mt-6 w-full">
          <p className="mb-3 text-center text-xs font-semibold text-sub">مقدار</p>
          <div className="flex items-center justify-center gap-6">
            <RoundButton tone="green" size={48} label="زیاد کردن" icon={<Plus className="h-5 w-5" />} onClick={() => bump(1)} />
            <div className="min-w-24 text-center">
              <p className="text-2xl font-extrabold tnum">
                {unit === "serving" ? fa(qty, 1) : fa(grams)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">{unit === "serving" ? "وعده" : "گرم"}</p>
            </div>
            <RoundButton tone="sub" size={48} label="کم کردن" icon={<Minus className="h-5 w-5" />} onClick={() => bump(-1)} />
          </div>

          <Segmented
            id="qty-unit"
            className="mt-5"
            value={unit}
            onChange={(v) => setUnit(v)}
            options={[
              { value: "serving", label: "وعده" },
              { value: "gram", label: "گرم" },
            ]}
          />
        </div>

        <p className="mt-4 text-center text-[10.5px] leading-5 text-muted">
          مقادیر تغذیه‌ای تقریبی‌اند و ممکن است با دستور پخت شما متفاوت باشند.
        </p>

        <PrimaryButton className="mt-4" onClick={add}>
          افزودن به {MEAL_LABELS[meal]} · {fa(scale(food.calories))} کالری
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
