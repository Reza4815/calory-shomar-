"use client";

import { Minus, Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  IconBadge,
  PrimaryButton,
  RoundButton,
  Segmented,
} from "@/components/ui/primitives";
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

  useEffect(() => {
    setQty(1);
    setUnit("serving");
  }, [food?.id]);

  const grams = useMemo(() => {
    if (!food) return 0;
    return unit === "serving" ? Math.round(food.grams * qty) : Math.round(qty);
  }, [food, qty, unit]);

  const ratio = food && food.grams > 0 ? grams / food.grams : 0;
  const scale = (v: number) => Math.round(v * ratio);

  const step = unit === "serving" ? 0.5 : 25;
  const bump = (dir: number) =>
    setQty((q) => Math.max(step, round1(q + dir * step)));

  const add = () => {
    if (!food) return;

    // دیباگ: بررسی می‌کنیم آیا داده‌ها درست هستند یا نه
    console.log("Adding food:", {
      meal,
      foodName: food.name,
      grams,
      caloriesToAdd: Math.round(food.calories * (grams / food.grams)),
    });

    addFoodEntry(meal, food, grams);

    toast({
      title: "به " + MEAL_LABELS[meal] + " اضافه شد",
      description: food.name,
      tone: "green",
    });
    onClose();
  };

  if (!food) return null;

  const macros = [
    {
      label: "کالری",
      value: `${fa(scale(food.calories))}`,
      color: "#F2A94B",
      unit: "کالری",
    },
    {
      label: "پروتئین",
      value: `${fa(scale(food.protein))}`,
      color: "#F16B68",
      unit: "گرم",
    },
    {
      label: "کربوهیدرات",
      value: `${fa(scale(food.carbs))}`,
      color: "#E8C15A",
      unit: "گرم",
    },
    {
      label: "چربی",
      value: `${fa(scale(food.fat))}`,
      color: "#9B78E8",
      unit: "گرم",
    },
  ];

  return (
    <Sheet
      open
      onClose={onClose}
      title={food.name}
      subtitle={`هر ${food.serving} · ${fa(food.grams)} گرم`}
    >
      <div className="flex flex-col items-center pt-1">
        <IconBadge icon={foodIcon(food.tag, 30)} tone="green" size={72} />

        <div className="mt-5 grid w-full grid-cols-4 gap-2">
          {macros.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/[0.03] bg-[#16181c] px-1.5 py-3 text-center"
            >
              <p
                className="text-[13px] font-extrabold tnum"
                style={{ color: m.color }}
              >
                {m.value}
              </p>
              <p className="mt-0.5 text-[10px] text-[#8b8e98]">
                {m.unit === "کالری" ? "کالری" : `${m.label} (گرم)`}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 w-full">
          <p className="mb-3 text-center text-xs font-semibold text-[#8b8e98]">
            مقدار
          </p>
          <div className="flex items-center justify-center gap-6">
            <RoundButton
              tone="green"
              size={48}
              label="زیاد کردن"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => bump(1)}
            />
            <div className="min-w-24 text-center">
              <p className="text-2xl font-extrabold tnum">
                {unit === "serving" ? fa(qty, 1) : fa(grams)}
              </p>
              <p className="mt-0.5 text-[11px] text-[#8b8e98]">
                {unit === "serving" ? "وعده" : "گرم"}
              </p>
            </div>
            <RoundButton
              tone="sub"
              size={48}
              label="کم کردن"
              icon={<Minus className="h-5 w-5" />}
              onClick={() => bump(-1)}
            />
          </div>

          <Segmented
            id="qty-unit"
            className="mt-5"
            value={unit}
            onChange={(v: any) => setUnit(v)}
            options={[
              { value: "serving", label: "وعده" },
              { value: "gram", label: "گرم" },
            ]}
          />
        </div>

        <p className="mt-4 text-center text-[10.5px] leading-5 text-[#8b8e98]">
          مقادیر تغذیه‌ای تقریبی‌اند و ممکن است با دستور پخت شما متفاوت باشند.
        </p>

        <PrimaryButton className="mt-4" onClick={add}>
          افزودن به {MEAL_LABELS[meal]} · {fa(scale(food.calories))} کالری
        </PrimaryButton>
      </div>
    </Sheet>
  );
}
