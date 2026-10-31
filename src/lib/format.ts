/* ---------- Persian formatting helpers ---------- */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Convert any Latin digits in a string/number to Persian digits */
export function faDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Format a number with Persian locale (Persian digits, ٫ separator) */
export function fa(num: number, maxFractionDigits = 0): string {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(num);
}

/** Local date key YYYY-MM-DD */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateOffsetKey(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return dayKey(d);
}

/** Today in Persian, e.g. «شنبه ۱۸ آبان» */
export function faFullDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

/** Short Persian date, e.g. «۱۸ آبان» */
export function faShortDate(d: Date): string {
  return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" }).format(d);
}

export function faShortDateKey(key: string): string {
  const [y, m, dd] = key.split("-").map(Number);
  return faShortDate(new Date(y, m - 1, dd));
}

/** Weekday name for a date key */
export function faWeekday(key: string): string {
  const [y, m, dd] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(new Date(y, m - 1, dd));
}

/** "HH:mm" -> Persian digits «۲۳:۳۰» */
export function faTime(time: string): string {
  return faDigits(time);
}

export function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Time-based greeting */
export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "شب بخیر";
  if (h < 11) return "صبح بخیر";
  if (h < 14) return "ظهر بخیر";
  if (h < 17) return "عصر بخیر";
  return "شب بخیر";
}

/** Stable unique id */
export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
