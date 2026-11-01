"use client";

import { BedDouble, Moon, Star, Sunrise, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/shell/screen-header";
import {
  Card,
  EmptyState,
  IconBadge,
  PageBody,
  PrimaryButton,
  ProgressBar,
} from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import {
  clamp,
  fa,
  faShortDateKey,
  faTime,
  faWeekday,
  round1,
} from "@/lib/format";
import { toast, useBodyStore, useProfileStore } from "@/stores";

function todayKeyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SleepPage() {
  const sleeps = useBodyStore((s) => s.sleeps);
  const upsertSleep = useBodyStore((s) => s.upsertSleep);
  const removeSleep = useBodyStore((s) => s.removeSleep);
  const goal = useProfileStore((s) => s.goals.sleepHours);

  const existing = sleeps.find((x) => x.date === todayKeyLocal());
  const [bedTime, setBedTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4);

  useEffect(() => {
    if (existing) {
      setBedTime(existing.bedTime);
      setWakeTime(existing.wakeTime);
      setQuality(existing.quality);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id]);

  let preview = round1(
    (() => {
      const [bh, bm] = bedTime.split(":").map(Number);
      const [wh, wm] = wakeTime.split(":").map(Number);
      let h = wh + wm / 60 - (bh + bm / 60);
      if (h <= 0) h += 24;
      return h;
    })(),
  );
  if (!Number.isFinite(preview)) preview = 0;

  const avg = sleeps.length
    ? round1(sleeps.reduce((a, s) => a + s.hours, 0) / sleeps.length)
    : 0;

  const save = () => {
    upsertSleep({ bedTime, wakeTime, quality });
    toast({
      title: "خواب دیشب ثبت شد",
      description: `${fa(preview, 1)} ساعت`,
      tone: "purple",
    });
  };

  return (
    <PageBody className="pt-6">
      <ScreenHeader title="خواب" subtitle="مدت و کیفیت خواب شبانه" />

      {/* tonight */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <IconBadge
            icon={<Moon className="h-5 w-5" />}
            tone="purple"
            size={46}
          />
          <div className="flex-1">
            <h3 className="text-[15px] font-bold">خواب دیشب</h3>
            <p className="text-xs text-sub">
              {existing ? "ثبت شده — می‌تونی ویرایش کنی" : "هنوز ثبت نشده"}
            </p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-extrabold tnum text-purple">
              {fa(preview, 1)}
            </p>
            <p className="text-[10px] text-muted">ساعت</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="block rounded-2xl border border-border/60 bg-surface p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sub">
              <Moon className="h-3.5 w-3.5 text-purple" /> ساعت خواب
            </span>
            <input
              type="time"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="mt-2 w-full bg-transparent text-lg font-extrabold tnum outline-none [color-scheme:dark]"
            />
          </label>
          <label className="block rounded-2xl border border-border/60 bg-surface p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sub">
              <Sunrise className="h-3.5 w-3.5 text-orange" /> ساعت بیداری
            </span>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="mt-2 w-full bg-transparent text-lg font-extrabold tnum outline-none [color-scheme:dark]"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-sub">کیفیت خواب</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((q) => (
              <button
                key={q}
                type="button"
                aria-label={`کیفیت ${q}`}
                onClick={() => setQuality(q as 1 | 2 | 3 | 4 | 5)}
                className="p-1"
              >
                <Star
                  className={cx(
                    "h-5 w-5 transition-colors",
                    q <= quality ? "fill-purple text-purple" : "text-border",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <PrimaryButton className="mt-5" onClick={save} tone="green">
          {existing ? "به‌روزرسانی خواب" : "ثبت خواب دیشب"}
        </PrimaryButton>
      </Card>

      {/* stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-[11px] text-muted">میانگین خواب</p>
          <p className="mt-1 text-xl font-extrabold tnum">
            {fa(avg, 1)}{" "}
            <span className="text-xs font-semibold text-sub">ساعت</span>
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] text-muted">هدف شبانه</p>
          <p className="mt-1 text-xl font-extrabold tnum">
            {fa(goal, 1)}{" "}
            <span className="text-xs font-semibold text-sub">ساعت</span>
          </p>
        </Card>
      </div>

      {/* history */}
      <Card className="mt-5 p-5">
        <h3 className="mb-3 text-[15px] font-bold">سوابق خواب</h3>
        {sleeps.length === 0 ? (
          <EmptyState
            icon={<BedDouble className="h-6 w-6" />}
            title="خوابی ثبت نشده"
            hint="هر شب قبل خواب ساعت‌هات رو وارد کن"
          />
        ) : (
          <div className="space-y-3">
            {[...sleeps].reverse().map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-border/50 bg-surface/60 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold tnum">
                      {fa(s.hours, 1)} ساعت
                    </p>
                    <p className="text-[10.5px] text-muted tnum">
                      {faWeekday(s.date)} {faShortDateKey(s.date)} ·{" "}
                      {faTime(s.bedTime)} تا {faTime(s.wakeTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((q) => (
                        <Star
                          key={q}
                          className={cx(
                            "h-3 w-3",
                            q <= s.quality
                              ? "fill-purple text-purple"
                              : "text-border",
                          )}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-label="حذف"
                      onClick={() => removeSleep(s.id)}
                      className="grid h-7 w-7 place-items-center rounded-full text-muted hover:text-red"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <ProgressBar
                  className="mt-2.5"
                  progress={clamp(s.hours / goal, 0, 1)}
                  color="#9B78E8"
                  height={6}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageBody>
  );
}
