"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  Dumbbell,
  Footprints,
  Info,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import {
  Card,
  EmptyState,
  IconBadge,
  PageBody,
  PrimaryButton,
  ProgressRing,
  RoundButton,
} from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import { fa, faShortDateKey, faTime, faWeekday } from "@/lib/format";
import { toast, useBodyStore, useProfileStore } from "@/stores";

const ACTIVITY_TYPES = [
  { label: "پیاده‌روی", kpm: 4 },
  { label: "دویدن", kpm: 10 },
  { label: "دوچرخه‌سواری", kpm: 7.5 },
  { label: "باشگاه", kpm: 8 },
  { label: "یوگا", kpm: 3 },
  { label: "شنا", kpm: 9 },
];

const activitySchema = z.object({
  type: z.string().min(1),
  minutes: z
    .number({ message: "مدت را وارد کن" })
    .min(5, "حداقل ۵ دقیقه")
    .max(300, "حداکثر ۳۰۰ دقیقه"),
});
type ActivityForm = z.infer<typeof activitySchema>;

function todayKeyLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ActivityPage() {
  const steps = useBodyStore((s) => s.steps[todayKeyLocal()] ?? 0);
  const setSteps = useBodyStore((s) => s.setSteps);
  const activities = useBodyStore((s) => s.activities);
  const addActivity = useBodyStore((s) => s.addActivity);
  const removeActivity = useBodyStore((s) => s.removeActivity);
  const stepsGoal = useProfileStore((s) => s.goals.dailySteps);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { type: "پیاده‌روی", minutes: 30 },
  });

  const type = watch("type");
  const minutes = watch("minutes") || 0;
  const kpm = ACTIVITY_TYPES.find((t) => t.label === type)?.kpm ?? 5;
  const estCalories = Math.round(kpm * minutes);

  const submit = (values: ActivityForm) => {
    addActivity({
      type: values.type,
      minutes: values.minutes,
      calories: estCalories,
    });
    toast({
      title: "فعالیت ثبت شد",
      description: `${values.type} · ${fa(values.minutes)} دقیقه`,
      tone: "green",
    });
    reset({ type: values.type, minutes: 30 });
  };

  return (
    <>
      <PageBody className="pt-5">
        {/* steps card */}
        <ScreenHeader title="فعالیت" subtitle="قدم‌ها و تمرین‌های روزانه" />
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <ProgressRing
              size={92}
              stroke={9}
              progress={stepsGoal ? steps / stepsGoal : 0}
              color="#F2A94B"
            >
              <Footprints className="h-6 w-6 text-orange" />
            </ProgressRing>
            <div className="flex-1">
              <p className="text-2xl font-extrabold tnum">
                {fa(steps)}{" "}
                <span className="text-xs font-semibold text-sub">قدم</span>
              </p>
              <p className="mt-1 text-xs text-sub tnum">
                هدف روزانه {fa(stepsGoal)} قدم
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <RoundButton
                  tone="green"
                  size={38}
                  label="بیشتر"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => setSteps(steps + 500)}
                />
                <span className="text-[10px] text-muted tnum">۵۰۰±</span>
                <RoundButton
                  tone="sub"
                  size={38}
                  label="کمتر"
                  icon={<Minus className="h-4 w-4" />}
                  onClick={() => {
                    if (steps > 0) setSteps(steps - 500);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-blue/25 bg-blue/10 px-3.5 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
            <p className="text-[11px] leading-5 text-sub">
              اتصال خودکار به سرویس سلامت گوشی فعلاً در دسترس نیست. قدم‌های
              امروزت رو همین‌جا دستی ثبت کن تا در گزارش‌ها لحاظ بشه.
            </p>
          </div>
        </Card>

        {/* exercise form */}
        <Card className="mt-5 p-5">
          <div className="mb-4 flex items-center gap-3">
            <IconBadge
              icon={<Dumbbell className="h-5 w-5" />}
              tone="orange"
              size={44}
            />
            <div>
              <h3 className="text-[15px] font-bold">ثبت تمرین</h3>
              <p className="text-xs text-sub">نوع و مدت تمرین رو مشخص کن</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setValue("type", t.label)}
                  className={cx(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                    type === t.label
                      ? "border-primary/60 bg-primary/12 text-primary"
                      : "border-border/70 bg-surface text-sub",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("type")} />

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-sub">
                مدت (دقیقه)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setValue("minutes", Math.min(300, minutes + 5))
                  }
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-surface text-sub"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  {...register("minutes", { valueAsNumber: true })}
                  className="w-16 rounded-xl border border-border/70 bg-surface py-2 text-center text-sm font-bold tnum outline-none focus:border-primary/60"
                />
                <button
                  type="button"
                  onClick={() => setValue("minutes", Math.max(5, minutes - 5))}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border/70 bg-surface text-sub"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
              <span className="mr-auto text-[11px] text-muted tnum">
                ≈ {fa(estCalories)} کالری
              </span>
            </div>
            {errors.minutes && (
              <p className="text-[11px] text-red">{errors.minutes.message}</p>
            )}

            <PrimaryButton>ثبت تمرین</PrimaryButton>
          </form>
        </Card>

        {/* history */}
        <Card className="mt-5 p-5">
          <h3 className="mb-3 text-[15px] font-bold">سوابق فعالیت</h3>
          {activities.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-6 w-6" />}
              title="تمرینی ثبت نشده"
              hint="اولین تمرینت رو بالا ثبت کن"
            />
          ) : (
            <div className="space-y-1">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5"
                >
                  <IconBadge
                    icon={<Dumbbell className="h-4 w-4" />}
                    tone="orange"
                    size={38}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold">{a.type}</p>
                    <p className="text-[10.5px] text-muted tnum">
                      {faWeekday(a.date)} {faShortDateKey(a.date)} · ساعت{" "}
                      {faTime(a.time)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-[12.5px] font-bold tnum">
                      {fa(a.minutes)} دقیقه
                    </p>
                    <p className="text-[10px] text-orange tnum">
                      {fa(a.calories)} کالری
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="حذف"
                    onClick={() => removeActivity(a.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-red/10 hover:text-red"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageBody>
    </>
  );
}
