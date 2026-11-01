"use client";

import { motion } from "framer-motion";
import { Minus, Pencil, Plus, Scale, Trash2, TrendingDown } from "lucide-react";
import { useState } from "react";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import {
  AnimatedNumber,
  Card,
  EmptyState,
  IconBadge,
  PageBody,
  PrimaryButton,
  ProgressBar,
  RoundButton,
} from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/sheet";
import { clamp, fa, faShortDateKey, round1 } from "@/lib/format";
import { toast, useBodyStore, useProfileStore } from "@/stores";

function WeightChart({ data }: { data: { key: string; kg: number }[] }) {
  if (data.length < 2) return null;
  const w = 320;
  const h = 120;
  const kgs = data.map((d) => d.kg);
  const min = Math.min(...kgs) - 0.4;
  const max = Math.max(...kgs) + 0.4;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 16) + 8;
    const y = h - 14 - ((d.kg - min) / (max - min)) * (h - 34);
    return { x, y, ...d };
  });
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <defs>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#20C98A" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#20C98A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#wg)" />
        <motion.path
          d={line}
          fill="none"
          stroke="#20C98A"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 4.5 : 3}
            fill={i === pts.length - 1 ? "#20C98A" : "#191D27"}
            stroke="#20C98A"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted tnum">
        <span>{faShortDateKey(data[0].key)}</span>
        <span>{faShortDateKey(data[data.length - 1].key)}</span>
      </div>
    </div>
  );
}

export default function WeightPage() {
  const weights = useBodyStore((s) => s.weights);
  const addWeight = useBodyStore((s) => s.addWeight);
  const removeWeight = useBodyStore((s) => s.removeWeight);
  const goals = useProfileStore((s) => s.goals);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [value, setValue] = useState(70);

  const latest = weights[weights.length - 1];
  const before = weights[weights.length - 2];
  const current = latest?.kg ?? goals.startWeightKg;
  const delta = latest && before ? round1(latest.kg - before.kg) : 0;
  const total = Math.max(0.1, goals.startWeightKg - goals.targetWeightKg);
  const progress = clamp((goals.startWeightKg - current) / total, 0, 1);
  const remaining = Math.max(0, round1(current - goals.targetWeightKg));

  const openSheet = () => {
    setValue(current);
    setSheetOpen(true);
  };

  const save = () => {
    addWeight(value);
    setSheetOpen(false);
    toast({
      title: "وزن امروز ثبت شد",
      description: `${fa(value, 1)} کیلو`,
      tone: "green",
    });
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const recordedToday = latest?.date === todayKey;

  return (
    <>
      <PageBody className="pt-5">
        {" "}
        <ScreenHeader title="پیشرفت وزن" subtitle="ثبت و پیگیری تغییرات وزن" />
        {/* current */}
        <Card glow="green" className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-sub">وزن فعلی</p>
              <p className="mt-1 text-[38px] font-extrabold leading-none tnum">
                <AnimatedNumber value={current} digits={1} />{" "}
                <span className="text-sm font-semibold text-sub">کیلو</span>
              </p>
              {latest && before && (
                <p
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${delta <= 0 ? "bg-primary/12 text-primary" : "bg-red/12 text-red"}`}
                >
                  <TrendingDown
                    className={`h-3 w-3 ${delta > 0 ? "rotate-180" : ""}`}
                  />
                  {delta <= 0 ? fa(Math.abs(delta), 1) : fa(delta, 1)} کیلو{" "}
                  {delta <= 0 ? "کمتر" : "بیشتر"}
                </p>
              )}
            </div>
            <IconBadge
              icon={<Scale className="h-6 w-6" />}
              tone="green"
              size={56}
            />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-sub">
                شروع {fa(goals.startWeightKg, 1)} ← هدف{" "}
                {fa(goals.targetWeightKg, 1)} کیلو
              </span>
              <span className="font-bold text-primary tnum">
                {fa(Math.round(progress * 100))}٪ مسیر
              </span>
            </div>
            <ProgressBar progress={progress} />
            <p className="mt-2 text-[11px] text-muted tnum">
              {remaining > 0
                ? `${fa(remaining, 1)} کیلو تا هدف مانده`
                : "به هدف وزنی رسیدی؛ حالا حفظش کن!"}
            </p>
          </div>

          <PrimaryButton className="mt-5" onClick={openSheet}>
            <span className="inline-flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              {recordedToday ? "ویرایش وزن امروز" : "ثبت وزن امروز"}
            </span>
          </PrimaryButton>
        </Card>
        {/* chart */}
        <Card className="mt-5 p-5">
          <h3 className="mb-4 text-[15px] font-bold">نمودار تغییرات</h3>
          {weights.length >= 2 ? (
            <WeightChart
              data={weights.slice(-8).map((r) => ({ key: r.date, kg: r.kg }))}
            />
          ) : (
            <EmptyState
              icon={<Scale className="h-6 w-6" />}
              title="داده کافی نیست"
              hint="چند بار وزن ثبت کن تا نمودار ساخته شود"
            />
          )}
        </Card>
        {/* history */}
        <Card className="mt-5 p-5">
          <h3 className="mb-3 text-[15px] font-bold">سوابق وزن</h3>
          <div className="space-y-1">
            {[...weights].reverse().map((r, idx, arr) => {
              const prev = arr[idx + 1];
              const d = prev ? round1(r.kg - prev.kg) : 0;
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold tnum">
                      {fa(r.kg, 1)} کیلو
                    </p>
                    <p className="text-[10.5px] text-muted tnum">
                      {faShortDateKey(r.date)}
                    </p>
                  </div>
                  {prev && (
                    <span
                      className={`text-[11px] font-semibold tnum ${d <= 0 ? "text-primary" : "text-red"}`}
                    >
                      {d === 0
                        ? "—"
                        : d < 0
                          ? `${fa(Math.abs(d), 1)}-`
                          : `${fa(d, 1)}+`}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label="حذف رکورد"
                    onClick={() => removeWeight(r.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-red/10 hover:text-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </PageBody>

      {/* entry sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="ثبت وزن"
        subtitle="وزن امروزت رو وارد کن"
      >
        <div className="flex flex-col items-center py-2">
          <p className="text-5xl font-extrabold tnum">{fa(value, 1)}</p>
          <p className="mt-1 text-xs text-muted">کیلوگرم</p>
          <div className="mt-6 flex items-center gap-7">
            <RoundButton
              tone="green"
              size={52}
              label="زیاد کردن"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => setValue((v) => Math.min(200, round1(v + 0.1)))}
            />
            <RoundButton
              tone="sub"
              size={52}
              label="کم کردن"
              icon={<Minus className="h-5 w-5" />}
              onClick={() => setValue((v) => Math.max(30, round1(v - 0.1)))}
            />
          </div>
          <div className="mt-4 grid w-full grid-cols-4 gap-2">
            {[-1, -0.5, 0.5, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setValue((v) => clamp(round1(v + d), 30, 200))}
                className="rounded-full border border-border/70 bg-surface py-2 text-xs font-bold tnum text-sub transition-colors active:border-primary/50 active:text-primary"
              >
                {d > 0 ? `+${fa(d, 1)}` : `${fa(d * -1, 1)}-`}
              </button>
            ))}
          </div>
          <PrimaryButton className="mt-6" onClick={save}>
            ثبت
          </PrimaryButton>
        </div>
      </Sheet>
    </>
  );
}
