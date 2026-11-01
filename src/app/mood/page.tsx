"use client";

import {
  Angry,
  Frown,
  HeartPulse,
  Laugh,
  Meh,
  Smile,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import {
  Card,
  EmptyState,
  IconBadge,
  PageBody,
  PrimaryButton,
} from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import { faShortDateKey, faTime, faWeekday } from "@/lib/format";
import { toast, useBodyStore } from "@/stores";

const MOODS = [
  { value: 1, label: "دلگیر", icon: Angry },
  { value: 2, label: "بی‌حال", icon: Frown },
  { value: 3, label: "معمولی", icon: Meh },
  { value: 4, label: "خوب", icon: Smile },
  { value: 5, label: "عالی", icon: Laugh },
] as const;

function todayKeyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MoodPage() {
  const moods = useBodyStore((s) => s.moods);
  const upsertMood = useBodyStore((s) => s.upsertMood);
  const removeMood = useBodyStore((s) => s.removeMood);

  const existing = moods.find((m) => m.date === todayKeyLocal());
  const [mood, setMood] = useState<number>(existing?.mood ?? 0);
  const [note, setNote] = useState(existing?.note ?? "");

  const save = () => {
    if (!mood) return;
    upsertMood(mood, note);
    toast({
      title: "حال امروز ثبت شد",
      description: MOODS[mood - 1].label,
      tone: "green",
    });
  };

  return (
    <>
      <PageBody className="pt-5">
        <ScreenHeader title="حال من" subtitle="چک‌این روزانه‌ی احساسات" />
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <IconBadge
              icon={<HeartPulse className="h-5 w-5" />}
              tone="red"
              size={46}
            />
            <div>
              <h3 className="text-[15px] font-bold">امروز چه حالی داری؟</h3>
              <p className="text-xs text-sub">
                یکی رو انتخاب کن؛ اگه دوست داشتی یادداشت هم بذار
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-1.5">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const active = mood === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={cx(
                    "flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition-all",
                    active
                      ? "border-primary/70 bg-primary/12"
                      : "border-border/50 bg-surface/60",
                  )}
                >
                  <Icon
                    className={cx(
                      "h-7 w-7",
                      active ? "text-primary" : "text-muted",
                    )}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                  <span
                    className={cx(
                      "text-[10px]",
                      active ? "font-bold text-primary" : "text-muted",
                    )}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="یادداشت کوتاه (اختیاری)؛ مثلاً: امروز پرانرژی بودم…"
            className="mt-4 w-full resize-none rounded-2xl border border-border/60 bg-surface p-3.5 text-sm leading-6 outline-none focus:border-primary/60"
          />

          <PrimaryButton className="mt-4" disabled={!mood} onClick={save}>
            {existing ? "به‌روزرسانی حال امروز" : "ثبت حال امروز"}
          </PrimaryButton>
        </Card>

        <Card className="mt-5 p-5">
          <h3 className="mb-3 text-[15px] font-bold">سوابق حال</h3>
          {moods.length === 0 ? (
            <EmptyState
              icon={<Smile className="h-6 w-6" />}
              title="هنوز چیزی ثبت نشده"
              hint="اولین چک‌این امروزت رو انجام بده"
            />
          ) : (
            <div className="space-y-1">
              {[...moods].reverse().map((m) => {
                const meta = MOODS[m.mood - 1];
                const Icon = meta.icon;
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red/12 text-red">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold">{meta.label}</p>
                      <p className="truncate text-[10.5px] text-muted tnum">
                        {faWeekday(m.date)} {faShortDateKey(m.date)} ·{" "}
                        {faTime(m.time)}
                        {m.note ? ` — ${m.note}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="حذف"
                      onClick={() => removeMood(m.id)}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </PageBody>
    </>
  );
}
