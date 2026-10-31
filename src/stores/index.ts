"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FOOD_DB, PLANS_SEED } from "@/lib/data";
import { dateOffsetKey, dayKey, nowTime, uid } from "@/lib/format";
import type {
  ActivityRecord,
  FoodItem,
  FoodLogEntry,
  Goals,
  MealType,
  MoodRecord,
  Plan,
  Profile,
  Settings,
  SleepRecord,
  WaterUnit,
  WeightRecord,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  UI store (toasts + hydration gate) — not persisted                 */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: "green" | "blue" | "purple";
}

interface UiState {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  hydrated: false,
  setHydrated: (v) => set({ hydrated: v }),
  toasts: [],
  toast: (t) => {
    const id = uid("toast");
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 2600);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = (t: Omit<Toast, "id">) => useUiStore.getState().toast(t);

/* ------------------------------------------------------------------ */
/*  Profile, goals, settings                                           */
/* ------------------------------------------------------------------ */

interface ProfileState {
  profile: Profile;
  goals: Goals;
  settings: Settings;
  weightStatus: "کاهش" | "ثابت" | "افزایش";
  updateProfile: (p: Partial<Profile>) => void;
  updateGoals: (g: Partial<Goals>) => void;
  updateSettings: (s: Partial<Settings>) => void;
  setWeightStatus: (v: ProfileState["weightStatus"]) => void;
  resetAll: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: { name: "رضا", age: 29, heightCm: 168, gender: "female", city: "تهران" },
      goals: {
        startWeightKg: 72,
        targetWeightKg: 64,
        dailyWaterGlasses: 8,
        dailySteps: 8000,
        dailyCalories: 2500,
        sleepHours: 7.5,
        dailyProtein: 150,
        dailyCarbs: 250,
        dailySugar: 40,
      },
      settings: { notifications: true, sound: true, healthSync: false },
      weightStatus: "کاهش",
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      updateGoals: (g) => set((s) => ({ goals: { ...s.goals, ...g } })),
      updateSettings: (s2) => set((s) => ({ settings: { ...s.settings, ...s2 } })),
      setWeightStatus: (v) => set({ weightStatus: v }),
      resetAll: () => {
        if (typeof window !== "undefined") {
          Object.keys(localStorage)
            .filter((k) => k.startsWith("refa:"))
            .forEach((k) => localStorage.removeItem(k));
          window.location.reload();
        }
      },
    }),
    { name: "refa:profile:v1", version: 2, storage: createJSONStorage(() => localStorage), skipHydration: true,
      // v1 → v2: add daily macro goals (protein/carbs/sugar) + daily calorie goal moved to 2500 kcal
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<ProfileState>;
        return {
          ...s,
          goals: {
            // stored values win; new fields fall back to defaults (old persisted goals lack them)
            dailyProtein: 150,
            dailyCarbs: 250,
            dailySugar: 40,
            ...s.goals,
            dailyCalories: 2500,
          },
        } as unknown as ProfileState;
      } }
  )
);

/* ------------------------------------------------------------------ */
/*  Nutrition: foods + food logs + water                               */
/* ------------------------------------------------------------------ */

interface NutritionState {
  foods: FoodItem[];
  addFood: (f: Omit<FoodItem, "id" | "custom">) => FoodItem;
  updateFood: (id: string, f: Partial<FoodItem>) => void;
  removeFood: (id: string) => void;
  logs: Record<string, FoodLogEntry[]>;
  addFoodEntry: (meal: MealType, food: FoodItem, grams: number, date?: string) => void;
  removeFoodEntry: (date: string, id: string) => void;
  water: Record<string, number>;
  addWater: (delta: number, date?: string) => void;
  waterUnit: WaterUnit;
  setWaterUnit: (u: WaterUnit) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      foods: FOOD_DB,
      addFood: (f) => {
        const item: FoodItem = { ...f, id: uid("food"), custom: true };
        set((s) => ({ foods: [item, ...s.foods] }));
        return item;
      },
      updateFood: (id, f) =>
        set((s) => ({ foods: s.foods.map((x) => (x.id === id ? { ...x, ...f } : x)) })),
      removeFood: (id) => set((s) => ({ foods: s.foods.filter((x) => x.id !== id) })),
      logs: {},
      addFoodEntry: (meal, food, grams, date) => {
        const d = date ?? dayKey();
        const ratio = grams / food.grams;
        const entry: FoodLogEntry = {
          id: uid("log"),
          foodId: food.id,
          name: food.name,
          meal,
          grams,
          calories: Math.round(food.calories * ratio),
          protein: Math.round(food.protein * ratio),
          carbs: Math.round(food.carbs * ratio),
          // sugar is optional on FoodItem (custom foods) — falls back to 0
          sugar: Math.round((food.sugar ?? 0) * ratio),
          fat: Math.round(food.fat * ratio),
          time: nowTime(),
        };
        const list = [...(get().logs[d] ?? []), entry];
        set((s) => ({ logs: { ...s.logs, [d]: list } }));
      },
      removeFoodEntry: (date, id) =>
        set((s) => {
          const list = (s.logs[date] ?? []).filter((x) => x.id !== id);
          const logs = { ...s.logs };
          if (list.length === 0) delete logs[date];
          else logs[date] = list;
          return { logs };
        }),
      water: {},
      addWater: (delta, date) => {
        const d = date ?? dayKey();
        const current = get().water[d] ?? 0;
        const next = Math.max(0, current + delta);
        set((s) => ({ water: { ...s.water, [d]: next } }));
      },
      waterUnit: "glass",
      setWaterUnit: (u) => set({ waterUnit: u }),
    }),
    { name: "refa:nutrition:v1", storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);

/* ------------------------------------------------------------------ */
/*  Day totals — derived from today's logs (calories, macros, sugar)   */
/* ------------------------------------------------------------------ */

export interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  sugar: number;
  fat: number;
  count: number;
}

const ZERO_TOTALS: DayTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  sugar: 0,
  fat: 0,
  count: 0,
};

/** Reduce a list of food-log entries into the day's totals.
 *  `e.sugar ?? 0` keeps old persisted entries (pre-sugar) safe. */
export function dayTotals(entries: FoodLogEntry[]): DayTotals {
  return entries.reduce(
    (a, e) => ({
      calories: a.calories + e.calories,
      protein: a.protein + e.protein,
      carbs: a.carbs + e.carbs,
      sugar: a.sugar + (e.sugar ?? 0),
      fat: a.fat + e.fat,
      count: a.count + 1,
    }),
    ZERO_TOTALS,
  );
}

/* ------------------------------------------------------------------ */
/*  Body: weight, sleep, activity, mood                                */
/* ------------------------------------------------------------------ */

interface BodyState {
  weights: WeightRecord[];
  addWeight: (kg: number, date?: string) => void;
  removeWeight: (id: string) => void;
  sleeps: SleepRecord[];
  upsertSleep: (r: { bedTime: string; wakeTime: string; quality: 1 | 2 | 3 | 4 | 5 }, date?: string) => void;
  removeSleep: (id: string) => void;
  activities: ActivityRecord[];
  addActivity: (a: { type: string; minutes: number; calories: number }, date?: string) => void;
  removeActivity: (id: string) => void;
  steps: Record<string, number>;
  setSteps: (steps: number, date?: string) => void;
  moods: MoodRecord[];
  upsertMood: (mood: number, note: string, date?: string) => void;
  removeMood: (id: string) => void;
}

export const useBodyStore = create<BodyState>()(
  persist(
  (set, get) => ({
      weights: [
        { id: "w-seed-8", date: dateOffsetKey(-40), kg: 72 },
        { id: "w-seed-7", date: dateOffsetKey(-33), kg: 71.6 },
        { id: "w-seed-6", date: dateOffsetKey(-26), kg: 71.2 },
        { id: "w-seed-5", date: dateOffsetKey(-19), kg: 70.8 },
        { id: "w-seed-4", date: dateOffsetKey(-12), kg: 70.6 },
        { id: "w-seed-3", date: dateOffsetKey(-6), kg: 70.2 },
        { id: "w-seed-2", date: dateOffsetKey(-1), kg: 70 },
      ],
      addWeight: (kg, date) => {
        const d = date ?? dayKey();
        const records = get().weights.filter((w) => w.date !== d);
        const entry: WeightRecord = { id: uid("w"), date: d, kg };
        set({ weights: [...records, entry].sort((a, b) => a.date.localeCompare(b.date)) });
      },
      removeWeight: (id) => set((s) => ({ weights: s.weights.filter((w) => w.id !== id) })),
      sleeps: [
        { id: "s-seed-3", date: dateOffsetKey(-3), bedTime: "23:40", wakeTime: "06:50", hours: 7.2, quality: 4 },
        { id: "s-seed-2", date: dateOffsetKey(-2), bedTime: "00:30", wakeTime: "07:10", hours: 6.7, quality: 3 },
        { id: "s-seed-1", date: dateOffsetKey(-1), bedTime: "23:10", wakeTime: "06:40", hours: 7.5, quality: 5 },
      ],
      upsertSleep: (r, date) => {
        const d = date ?? dayKey();
        const [bh, bm] = r.bedTime.split(":").map(Number);
        const [wh, wm] = r.wakeTime.split(":").map(Number);
        let hours = wh + wm / 60 - (bh + bm / 60);
        if (hours <= 0) hours += 24;
        hours = Math.round(hours * 10) / 10;
        const others = get().sleeps.filter((s) => s.date !== d);
        const entry: SleepRecord = { id: uid("s"), date: d, ...r, hours };
        set({ sleeps: [...others, entry].sort((a, b) => a.date.localeCompare(b.date)) });
      },
      removeSleep: (id) => set((s) => ({ sleeps: s.sleeps.filter((x) => x.id !== id) })),
      activities: [
        { id: "a-seed-2", date: dateOffsetKey(-2), type: "دوچرخه‌سواری", minutes: 35, calories: 245, time: "18:20" },
        { id: "a-seed-1", date: dateOffsetKey(-1), type: "پیاده‌روی", minutes: 30, calories: 120, time: "17:05" },
      ],
      addActivity: (a, date) => {
        const d = date ?? dayKey();
        const entry: ActivityRecord = { id: uid("a"), date: d, ...a, time: nowTime() };
        set((s) => ({ activities: [entry, ...s.activities] }));
      },
      removeActivity: (id) => set((s) => ({ activities: s.activities.filter((x) => x.id !== id) })),
      steps: {
        [dateOffsetKey(-3)]: 5100,
        [dateOffsetKey(-2)]: 8400,
        [dateOffsetKey(-1)]: 6200,
      },
      setSteps: (steps, date) => {
        const d = date ?? dayKey();
        set((s) => ({ steps: { ...s.steps, [d]: Math.max(0, Math.round(steps)) } }));
      },
      moods: [
        { id: "m-seed-1", date: dateOffsetKey(-1), mood: 4, note: "روز خوبی بود", time: "21:12" },
      ],
      upsertMood: (mood, note, date) => {
        const d = date ?? dayKey();
        const others = get().moods.filter((m) => m.date !== d);
        const entry: MoodRecord = {
          id: uid("m"),
          date: d,
          mood: mood as MoodRecord["mood"],
          note: note.trim() ? note.trim() : undefined,
          time: nowTime(),
        };
        set({ moods: [...others, entry].sort((a, b) => a.date.localeCompare(b.date)) });
      },
      removeMood: (id) => set((s) => ({ moods: s.moods.filter((x) => x.id !== id) })),
    }),
    { name: "refa:body:v1", storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);

/* ------------------------------------------------------------------ */
/*  Plans                                                              */
/* ------------------------------------------------------------------ */

interface PlansState {
  plans: Plan[];
  togglePlanTask: (planId: string, taskId: string) => void;
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set) => ({
      plans: PLANS_SEED,
      togglePlanTask: (planId, taskId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id !== planId
              ? p
              : {
                  ...p,
                  weeks: p.weeks.map((w) => ({
                    ...w,
                    tasks: w.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
                  })),
                }
          ),
        })),
    }),
    { name: "refa:plans:v1", storage: createJSONStorage(() => localStorage), skipHydration: true }
  )
);

/* ------------------------------------------------------------------ */
/*  Hydration helper — rehydrate all persisted stores after mount      */
/* ------------------------------------------------------------------ */

const PERSISTED = [useProfileStore, useNutritionStore, useBodyStore, usePlansStore];

export function useHydrated(): boolean {
  const hydrated = useUiStore((s) => s.hydrated);
  const setHydrated = useUiStore((s) => s.setHydrated);

  useEffect(() => {
    if (hydrated) return;
    let alive = true;
    (async () => {
      await Promise.all(
        PERSISTED.map((s) =>
          Promise.resolve(s.persist.rehydrate()).catch(() => undefined)
        )
      );
      if (alive) setHydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, [hydrated, setHydrated]);

  return hydrated;
}

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // setState in a rAF callback (not synchronously during the effectBody)
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}
