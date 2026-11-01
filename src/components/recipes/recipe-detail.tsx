"use client";

import { motion } from "framer-motion";
import { Check, Clock, Flame, ListChecks, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import { Card, IconBadge, PageBody, PrimaryButton } from "@/components/ui/primitives";
import { RecipeIcon } from "@/components/recipes/recipe-icon";
import { cx } from "@/lib/cx";
import { fa } from "@/lib/format";
import { toast, useNutritionStore } from "@/stores";
import type { Recipe } from "@/lib/types";

export function RecipeDetailClient({ recipe }: { recipe: Recipe }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const addFoodEntry = useNutritionStore((s) => s.addFoodEntry);

  const macros = [
    { label: "کالری", value: recipe.calories, unit: "کالری", color: "#F2A94B" },
    { label: "پروتئین", value: recipe.protein, unit: "گرم", color: "#F16B68" },
    { label: "کربوهیدرات", value: recipe.carbs, unit: "گرم", color: "#E8C15A" },
    { label: "چربی", value: recipe.fat, unit: "گرم", color: "#9B78E8" },
  ];

  const logAsMeal = () => {
    addFoodEntry("lunch", {
      id: recipe.id,
      name: recipe.name + " (دستور پخت)",
      serving: "۱ وعده",
      grams: 350,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      meals: ["lunch", "dinner"],
    }, 350);
    toast({ title: "به ناهار امروز اضافه شد", description: recipe.name, tone: "green" });
  };

  return (
    <>
      <ScreenHeader title={recipe.name} subtitle={`${recipe.difficulty} · آماده‌سازی ${fa(recipe.minutes)} دقیقه`} />


      <PageBody className="pt-5">
        {/* banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center rounded-[26px] border border-border/60 bg-card p-6"
        >
          <RecipeIcon tone={recipe.tone} size={96} iconSize={40} />
          <h1 className="mt-4 text-center text-xl font-extrabold">{recipe.name}</h1>
          <p className="mt-1.5 text-center text-xs leading-6 text-sub">{recipe.description}</p>
          <div className="mt-4 flex items-center gap-2">
            {recipe.tags.map((t) => (
              <span key={t} className="rounded-full bg-surface px-3 py-1 text-[10.5px] font-semibold text-sub">{t}</span>
            ))}
            <span className="flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-[10.5px] font-semibold text-sub tnum">
              <Clock className="h-3 w-3 text-blue" /> {fa(recipe.minutes)} دقیقه
            </span>
          </div>
        </motion.div>

        {/* macros */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {macros.map((m) => (
            <Card key={m.label} className="px-2 py-3 text-center">
              <p className="text-[15px] font-extrabold tnum" style={{ color: m.color }}>{fa(m.value)}</p>
              <p className="mt-0.5 text-[9.5px] text-muted">{m.label} ({m.unit === "کالری" ? "کالری" : "گرم"})</p>
            </Card>
          ))}
        </div>

        {/* ingredients */}
        <Card className="mt-4 p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <IconBadge icon={<ListChecks className="h-4.5 w-4.5" />} tone="green" size={38} />
            <h2 className="text-[15px] font-bold">مواد لازم</h2>
            <span className="mr-auto text-[10px] text-muted tnum">{fa(recipe.ingredients.length)} قلم</span>
          </div>
          <div className="space-y-1">
            {recipe.ingredients.map((ing, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-right transition-colors hover:bg-white/[0.02]"
              >
                <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors", checked[i] ? "border-primary bg-primary" : "border-border")}>
                  {checked[i] && <Check className="h-3 w-3 text-[#05130D]" strokeWidth={3.4} />}
                </span>
                <span className={cx("flex-1 text-[13px] font-medium", checked[i] && "text-sub line-through decoration-border")}>{ing.name}</span>
                <span className="text-[11px] font-semibold text-sub tnum">{ing.amount}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* steps */}
        <Card className="mt-4 p-5">
          <div className="mb-3 flex items-center gap-2.5">
            <IconBadge icon={<UtensilsCrossed className="h-4.5 w-4.5" />} tone="orange" size={38} />
            <h2 className="text-[15px] font-bold">طرز تهیه</h2>
          </div>
          <ol className="space-y-3.5">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-extrabold text-primary tnum">
                  {fa(i + 1)}
                </span>
                <p className="pt-0.5 text-[12.5px] leading-6 text-sub">{step}</p>
              </li>
            ))}
          </ol>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <Flame className="h-3 w-3" />
          مقادیر تغذیه‌ای تقریبی است و تایید پزشکی ندارد.
        </div>

        <PrimaryButton className="mt-3" onClick={logAsMeal}>
          پختم؛ به وعده‌های امروز اضافه کن
        </PrimaryButton>
      </PageBody>
    </>
  );
}
