"use client";

import { Bell, Cake, Droplets, Flame, Footprints, Info, Minus, Moon, Music, Pencil, Plus, RefreshCcw, Ruler, Trophy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { HeaderSpacer, ScreenHeader } from "@/components/shell/screen-header";
import { Card, IconBadge, PageBody, PrimaryButton, type Tone } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/sheet";
import { cx } from "@/lib/cx";
import { fa } from "@/lib/format";
import { toast, useBodyStore, useProfileStore } from "@/stores";

/* ---------- toggle switch ---------- */
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-border")}
    >
      <span
        className={cx(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-1" : "left-6"
        )}
        style={checked ? { background: "#05130D" } : undefined}
      />
    </button>
  );
}

/* ---------- goal stepper row ---------- */
function GoalRow({
  icon,
  tone,
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: {
  icon: ReactNode;
  tone: Tone;
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <IconBadge icon={icon} tone={tone} size={40} />
      <div className="flex-1">
        <p className="text-[13px] font-bold">{label}</p>
        <p className="text-[10.5px] text-muted tnum">{fa(value)}{unit && ` ${unit}`}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="بیشتر" onClick={() => onChange(Math.min(max, value + step))} className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-surface text-sub active:text-text">
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label="کمتر" onClick={() => onChange(Math.max(min, value - step))} className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-surface text-sub active:text-text">
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile);
  const goals = useProfileStore((s) => s.goals);
  const settings = useProfileStore((s) => s.settings);
  const updateGoals = useProfileStore((s) => s.updateGoals);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const updateSettings = useProfileStore((s) => s.updateSettings);
  const resetAll = useProfileStore((s) => s.resetAll);
  const latestWeight = useBodyStore((s) => s.weights[s.weights.length - 1]?.kg);

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [confirmReset, setConfirmReset] = useState(false);

  const initials = profile.name.trim().slice(0, 1);

  const openEdit = () => {
    setName(profile.name);
    setAge(String(profile.age));
    setHeight(String(profile.heightCm));
    setEditOpen(true);
  };

  const saveProfile = () => {
    if (name.trim().length < 2) {
      toast({ title: "نام کوتاه است", description: "حداقل ۲ حرف وارد کن", tone: "purple" });
      return;
    }
    updateProfile({
      name: name.trim(),
      age: Math.min(99, Math.max(10, Number(age) || profile.age)),
      heightCm: Math.min(220, Math.max(120, Number(height) || profile.heightCm)),
    });
    setEditOpen(false);
    toast({ title: "پروفایل به‌روز شد", tone: "green" });
  };

  return (
    <>
      <ScreenHeader title="پروفایل" subtitle="اطلاعات و اهداف روزانه" />
      <HeaderSpacer />

      <PageBody className="pt-5">
        {/* user card */}
        <Card glow="green" className="flex items-center gap-4 p-5">
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary/80 to-primary-deep text-2xl font-extrabold text-[#05130D]">
              {initials}
            </div>
            <span className="absolute -bottom-1 -left-1 grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-elevated">
              <Trophy className="h-3 w-3 text-orange" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-extrabold">{profile.name}</h2>
            <p className="mt-1 flex items-center gap-3 text-[11px] text-sub tnum">
              <span className="flex items-center gap-1"><Cake className="h-3 w-3" />{fa(profile.age)} سال</span>
              <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{fa(profile.heightCm)} سانتی‌متر</span>
            </p>
          </div>
          <button type="button" aria-label="ویرایش پروفایل" onClick={openEdit} className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-surface text-sub">
            <Pencil className="h-4 w-4" />
          </button>
        </Card>

        {/* weight stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Card className="p-3.5 text-center">
            <p className="text-[15px] font-extrabold tnum">{latestWeight ? fa(latestWeight, 1) : "—"}</p>
            <p className="mt-0.5 text-[10px] text-muted">وزن فعلی (کیلو)</p>
          </Card>
          <Card className="p-3.5 text-center">
            <p className="text-[15px] font-extrabold tnum text-primary">{fa(goals.targetWeightKg, 1)}</p>
            <p className="mt-0.5 text-[10px] text-muted">وزن هدف (کیلو)</p>
          </Card>
          <Card className="p-3.5 text-center">
            <p className="text-[15px] font-extrabold tnum text-orange">{fa(goals.dailyCalories)}</p>
            <p className="mt-0.5 text-[10px] text-muted">کالری روزانه</p>
          </Card>
        </div>

        {/* daily goals */}
        <Card className="mt-4 p-5">
          <h3 className="mb-1 text-[15px] font-bold">اهداف روزانه</h3>
          <div className="divide-y divide-border/40">
            <GoalRow icon={<Droplets className="h-4.5 w-4.5" />} tone="blue" label="آب روزانه" value={goals.dailyWaterGlasses} unit="لیوان" step={1} min={4} max={16} onChange={(v) => updateGoals({ dailyWaterGlasses: v })} />
            <GoalRow icon={<Footprints className="h-4.5 w-4.5" />} tone="orange" label="قدم روزانه" value={goals.dailySteps} unit="قدم" step={500} min={2000} max={20000} onChange={(v) => updateGoals({ dailySteps: v })} />
            <GoalRow icon={<Flame className="h-4.5 w-4.5" />} tone="red" label="کالری روزانه" value={goals.dailyCalories} unit="کالری" step={50} min={1200} max={3500} onChange={(v) => updateGoals({ dailyCalories: v })} />
            <GoalRow icon={<Moon className="h-4.5 w-4.5" />} tone="purple" label="خواب شبانه" value={goals.sleepHours} unit="ساعت" step={0.5} min={5} max={10} onChange={(v) => updateGoals({ sleepHours: v })} />
          </div>
          <div className="mt-3 border-t border-border/40 pt-3">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[12.5px] font-semibold text-sub">وزن هدف</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => updateGoals({ targetWeightKg: Math.min(150, goals.targetWeightKg + 1) })} className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-surface text-sub"><Plus className="h-3.5 w-3.5" /></button>
                <span className="w-16 text-center text-[13px] font-extrabold tnum">{fa(goals.targetWeightKg)} کیلو</span>
                <button type="button" onClick={() => updateGoals({ targetWeightKg: Math.max(40, goals.targetWeightKg - 1) })} className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-surface text-sub"><Minus className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </Card>

        {/* settings */}
        <Card className="mt-4 p-5">
          <h3 className="mb-2 text-[15px] font-bold">تنظیمات</h3>
          <div className="divide-y divide-border/40">
            <div className="flex items-center gap-3 py-3">
              <IconBadge icon={<Bell className="h-4.5 w-4.5" />} tone="green" size={40} />
              <div className="flex-1">
                <p className="text-[13px] font-bold">یادآوری‌های روزانه</p>
                <p className="text-[10.5px] text-muted">یادآور آب و ثبت وعده‌ها</p>
              </div>
              <Switch checked={settings.notifications} onChange={(v) => updateSettings({ notifications: v })} label="یادآوری‌ها" />
            </div>
            <div className="flex items-center gap-3 py-3">
              <IconBadge icon={<Music className="h-4.5 w-4.5" />} tone="purple" size={40} />
              <div className="flex-1">
                <p className="text-[13px] font-bold">صدا و بازخورد</p>
                <p className="text-[10.5px] text-muted">تأیید لمسی هنگام ثبت</p>
              </div>
              <Switch checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} label="صدا" />
            </div>
            <div className="flex items-center gap-3 py-3">
              <IconBadge icon={<Footprints className="h-4.5 w-4.5" />} tone="blue" size={40} />
              <div className="flex-1">
                <p className="text-[13px] font-bold">همگام‌سازی سلامت</p>
                <p className="text-[10.5px] text-muted">فعلاً در نسخه وب در دسترس نیست</p>
              </div>
              <Switch checked={false} onChange={() => toast({ title: "فعلاً در دسترس نیست", description: "قدم‌ها را دستی ثبت کن", tone: "blue" })} label="همگام‌سازی سلامت" />
            </div>
          </div>
        </Card>

        {/* danger zone */}
        <button
          type="button"
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              setTimeout(() => setConfirmReset(false), 3500);
            } else {
              resetAll();
            }
          }}
          className={cx(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-[12.5px] font-bold transition-colors",
            confirmReset ? "border-red/60 bg-red/10 text-red" : "border-border/60 bg-card text-sub"
          )}
        >
          <RefreshCcw className="h-4 w-4" />
          {confirmReset ? "مطمئنی؟ دوباره بزن تا همه داده‌ها پاک شود" : "بازنشانی همه داده‌ها"}
        </button>

        <p className="mt-4 flex items-center justify-center gap-1.5 pb-2 text-[10px] text-muted">
          <Info className="h-3 w-3" /> رفا نسخه ۱٫۰ — داده‌ها فقط روی همین دستگاه ذخیره می‌شوند
        </p>
      </PageBody>

      {/* edit profile sheet */}
      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="ویرایش پروفایل">
        <div className="space-y-3.5 pt-1">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-sub">نام و نام خانوادگی</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border/70 bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary/60" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-sub">سن</span>
              <input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} className="w-full rounded-xl border border-border/70 bg-surface px-3.5 py-2.5 text-sm tnum outline-none focus:border-primary/60" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-sub">قد (سانتی‌متر)</span>
              <input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full rounded-xl border border-border/70 bg-surface px-3.5 py-2.5 text-sm tnum outline-none focus:border-primary/60" />
            </label>
          </div>
          <PrimaryButton className="pt-1" onClick={saveProfile}>ذخیره</PrimaryButton>
        </div>
      </Sheet>
    </>
  );
}
