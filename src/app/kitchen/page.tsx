"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Pencil, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { foodIcon } from "@/components/food/food-icon";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import {
  Card,
  EmptyState,
  IconBadge,
  PageBody,
  PrimaryButton,
} from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/sheet";
import { cx } from "@/lib/cx";
import { fa } from "@/lib/format";
import { toast, useNutritionStore } from "@/stores";
import type { FoodItem, MealType } from "@/lib/types";

const foodSchema = z.object({
  name: z.string().min(2, "نام غذا حداقل ۲ حرف باشد"),
  grams: z
    .number({ message: "گرم را وارد کن" })
    .min(10, "حداقل ۱۰ گرم")
    .max(2000),
  calories: z.number({ message: "کالری را وارد کن" }).min(0).max(3000),
  protein: z.number({ message: "مقدار نامعتبر" }).min(0).max(300),
  carbs: z.number({ message: "مقدار نامعتبر" }).min(0).max(400),
  fat: z.number({ message: "مقدار نامعتبر" }).min(0).max(300),
});
type FoodForm = z.infer<typeof foodSchema>;

const MEAL_CHOICES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "صبحانه" },
  { value: "lunch", label: "ناهار" },
  { value: "snack", label: "میان‌وعده" },
  { value: "dinner", label: "شام" },
];

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-sub">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[11px] text-red">{error}</span>
      )}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-border/70 bg-surface px-3.5 py-2.5 text-sm tnum outline-none focus:border-primary/60";

export default function KitchenPage() {
  const foods = useNutritionStore((s) => s.foods);
  const addFood = useNutritionStore((s) => s.addFood);
  const updateFood = useNutritionStore((s) => s.updateFood);
  const removeFood = useNutritionStore((s) => s.removeFood);

  const myFoods = foods.filter((f) => f.custom);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [meals, setMeals] = useState<MealType[]>(["snack"]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FoodForm>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: "",
      grams: 100,
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 8,
    },
  });

  const openAdd = () => {
    setEditing(null);
    setMeals(["snack"]);
    reset({
      name: "",
      grams: 100,
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 8,
    });
    setSheetOpen(true);
  };

  const openEdit = (f: FoodItem) => {
    setEditing(f);
    setMeals(f.meals.length ? f.meals : ["snack"]);
    reset({
      name: f.name,
      grams: f.grams,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
    });
    setSheetOpen(true);
  };

  const toggleMeal = (m: MealType) =>
    setMeals((cur) =>
      cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m],
    );

  const submit = (values: FoodForm) => {
    const payload = {
      name: values.name.trim(),
      serving: `${fa(values.grams)} گرم`,
      grams: values.grams,
      calories: values.calories,
      protein: values.protein,
      carbs: values.carbs,
      fat: values.fat,
      meals: meals.length ? meals : (["snack"] as MealType[]),
      tag: "light" as const,
    };
    if (editing) {
      updateFood(editing.id, payload);
      toast({
        title: "غذا ویرایش شد",
        description: payload.name,
        tone: "green",
      });
    } else {
      addFood(payload);
      toast({
        title: "به آشپزخانه اضافه شد",
        description: payload.name,
        tone: "green",
      });
    }
    setSheetOpen(false);
  };

  return (
    <>
      <PageBody className="pt-5">
        <ScreenHeader
          title="آشپزخانه من"
          subtitle="غذاها و مواد غذایی شخصی‌ات"
        />
        <Card className="flex items-center gap-3 p-4" onClick={openAdd}>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-[#05130D] shadow-[0_6px_20px_rgba(32,201,138,0.35)]">
            <Plus className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[14px] font-bold">غذای جدید بساز</p>
            <p className="text-[11px] text-sub">
              با مقادیر تغذیه‌ای خودت؛ برای ثبت روزانه قابل استفاده است
            </p>
          </div>
        </Card>

        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">غذاهای من</h2>
          <span className="text-[11px] text-muted tnum">
            {fa(myFoods.length)} مورد
          </span>
        </div>

        {myFoods.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={<ShoppingBasket className="h-6 w-6" />}
              title="آشپزخانه‌ات خالی است"
              hint="غذاهای پرتکرارت را اضافه کن تا ثبت روزانه سریع‌تر شود"
            />
          </Card>
        ) : (
          <div className="space-y-2.5">
            {myFoods.map((f) => (
              <Card key={f.id} className="flex items-center gap-3 p-3.5">
                <IconBadge icon={foodIcon(f.tag, 19)} tone="green" size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold">{f.name}</p>
                  <p className="mt-1 text-[10.5px] text-muted tnum">
                    {f.serving} · {fa(f.calories)} کالری · پ {fa(f.protein)} · ک{" "}
                    {fa(f.carbs)} · چ {fa(f.fat)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="ویرایش"
                  onClick={() => openEdit(f)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-surface text-sub"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="حذف"
                  onClick={() => {
                    removeFood(f.id);
                    toast({
                      title: "حذف شد",
                      description: f.name,
                      tone: "purple",
                    });
                  }}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-surface text-sub hover:text-red"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        )}

        <p className="mt-5 rounded-2xl border border-border/50 bg-surface/60 p-4 text-center text-[11px] leading-5 text-sub">
          <ChefHat className="mb-1 inline h-3.5 w-3.5 text-primary" />{" "}
          {fa(foods.filter((f) => !f.custom).length)} غذای پیش‌فرض ایرانی هم در
          «افزودن وعده» در دسترس است.
        </p>
      </PageBody>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editing ? "ویرایش غذا" : "غذای جدید"}
        subtitle="مقادیر تقریبی را وارد کن"
      >
        <form onSubmit={handleSubmit(submit)} className="space-y-3.5 pt-1">
          <Field label="نام غذا" error={errors.name?.message}>
            <input
              {...register("name")}
              placeholder="مثلاً: مرغ گریل با سبزیجات"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="مقدار (گرم)" error={errors.grams?.message}>
              <input
                type="number"
                inputMode="numeric"
                {...register("grams", { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
            <Field label="کالری" error={errors.calories?.message}>
              <input
                type="number"
                inputMode="numeric"
                {...register("calories", { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="پروتئین" error={errors.protein?.message}>
              <input
                type="number"
                inputMode="numeric"
                {...register("protein", { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
            <Field label="کربوهیدرات" error={errors.carbs?.message}>
              <input
                type="number"
                inputMode="numeric"
                {...register("carbs", { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
            <Field label="چربی" error={errors.fat?.message}>
              <input
                type="number"
                inputMode="numeric"
                {...register("fat", { valueAsNumber: true })}
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-sub">
              مناسب برای
            </span>
            <div className="flex flex-wrap gap-2">
              {MEAL_CHOICES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleMeal(m.value)}
                  className={cx(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                    meals.includes(m.value)
                      ? "border-primary/60 bg-primary/12 text-primary"
                      : "border-border/70 bg-surface text-sub",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <PrimaryButton className="pt-1">
            {editing ? "ذخیره تغییرات" : "افزودن به آشپزخانه"}
          </PrimaryButton>
        </form>
      </Sheet>
    </>
  );
}
