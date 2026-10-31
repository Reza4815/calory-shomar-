import { FoodClient } from "@/components/food/food-client";
import type { MealType } from "@/lib/types";

const VALID: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

export default async function FoodPage({
  searchParams,
}: {
  searchParams: Promise<{ meal?: string }>;
}) {
  const { meal } = await searchParams;
  const initialMeal: MealType = VALID.includes(meal as MealType) ? (meal as MealType) : "snack";
  return <FoodClient initialMeal={initialMeal} />;
}
