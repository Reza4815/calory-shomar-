/* ---------- Shared domain types for رفا ---------- */

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";

export const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  snack: "میان‌وعده",
  dinner: "شام",
};

export type WaterUnit = "glass" | "bottle" | "liter";

export interface Profile {
  name: string;
  age: number;
  heightCm: number;
  gender: "female" | "male";
  city: string;
}

export interface Goals {
  startWeightKg: number;
  targetWeightKg: number;
  dailyWaterGlasses: number;
  dailySteps: number;
  dailyCalories: number;
  sleepHours: number;
  /** Macro goals (grams / day) — used by the calorie-card macro bars */
  dailyProtein: number;
  dailyCarbs: number;
  dailySugar: number;
}

export interface Settings {
  notifications: boolean;
  sound: boolean;
  healthSync: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  serving: string;
  grams: number; // grams per serving reference
  calories: number;
  protein: number;
  carbs: number;
  sugar?: number; // optional — falls back to 0 for custom foods
  fat: number;
  meals: MealType[];
  tag?: "protein" | "light" | "green" | "sweet" | "soup";
  custom?: boolean;
}

export interface FoodLogEntry {
  id: string;
  foodId: string;
  name: string;
  meal: MealType;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
  fat: number;
  time: string; // HH:mm
}

export interface WeightRecord {
  id: string;
  date: string; // YYYY-MM-DD
  kg: number;
}

export interface SleepRecord {
  id: string;
  date: string; // night of
  bedTime: string; // HH:mm
  wakeTime: string; // HH:mm
  hours: number;
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface ActivityRecord {
  id: string;
  date: string;
  type: string; // پیاده‌روی ...
  minutes: number;
  calories: number;
  time: string;
}

export interface MoodRecord {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;
  time: string;
}

export interface PlanTask {
  id: string;
  title: string;
  hint: string;
  done: boolean;
}

export interface PlanWeek {
  id: string;
  title: string;
  focus: string;
  tasks: PlanTask[];
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  tone: "green" | "blue" | "purple" | "orange";
  weeks: PlanWeek[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  minutes: number;
  difficulty: "آسان" | "متوسط" | "سخت";
  tone: "green" | "blue" | "purple" | "orange" | "red";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  ingredients: { name: string; amount: string }[];
  steps: string[];
}

export interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
  fat: number;
  mealsLogged: number;
}
