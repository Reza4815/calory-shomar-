"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Sparkles, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Card, IconBadge, PageBody, ProgressBar, ProgressRing, type Tone } from "@/components/ui/primitives";
import { cx } from "@/lib/cx";
import { fa } from "@/lib/format";
import { usePlansStore } from "@/stores";
import type { Plan } from "@/lib/types";

const PLAN_ICONS: Record<string, React.ReactNode> = {
  "plan-weight-loss": <Target className="h-5 w-5" />,
  "plan-balance": <Sparkles className="h-5 w-5" />,
  "plan-energy": <TrendingUp className="h-5 w-5" />,
};

const TONE_COLOR: Record<Plan["tone"], string> = {
  green: "#20C98A",
  blue: "#5599F2",
  purple: "#9B78E8",
  orange: "#F2A94B",
};

function planProgress(plan: Plan) {
  const total = plan.weeks.reduce((a, w) => a + w.tasks.length, 0);
  const done = plan.weeks.reduce((a, w) => a + w.tasks.filter((t) => t.done).length, 0);
  return { total, done, pct: total ? done / total : 0 };
}

export default function PlansPage() {
  const plans = usePlansStore((s) => s.plans);
  const togglePlanTask = usePlansStore((s) => s.togglePlanTask);
  const [openPlan, setOpenPlan] = useState<string | null>(plans[0]?.id ?? null);
  const reduce = useReducedMotion();

  return (
    <PageBody className="pt-6">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold">برنامه</h1>
        <p className="mt-1 text-sm text-sub">پلن‌های هفتگی برای رسیدن به هدفت</p>
      </div>

      <div className="space-y-4">
        {plans.map((plan, idx) => {
          const { total, done, pct } = planProgress(plan);
          const open = openPlan === plan.id;
          const color = TONE_COLOR[plan.tone];
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenPlan(open ? null : plan.id)}
                  className="w-full p-5 text-right"
                  aria-expanded={open}
                >
                  <div className="flex items-center gap-3">
                    <IconBadge icon={PLAN_ICONS[plan.id] ?? <Target className="h-5 w-5" />} tone={plan.tone as Tone} size={48} />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[15px] font-bold">{plan.title}</h2>
                      <p className="mt-0.5 truncate text-xs text-sub">{plan.description}</p>
                    </div>
                    <ProgressRing size={52} stroke={5.5} progress={pct} color={color}>
                      <span className="text-[10px] font-extrabold tnum">{fa(Math.round(pct * 100))}٪</span>
                    </ProgressRing>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
                    <span className="tnum">{fa(done)} از {fa(total)} کار انجام شده</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : undefined} className="text-sub">
                      <ChevronDown className="h-4 w-4" />
                    </motion.span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 border-t border-border/50 px-5 py-4">
                        {plan.weeks.map((week) => {
                          const wDone = week.tasks.filter((t) => t.done).length;
                          return (
                            <div key={week.id} className="rounded-2xl border border-border/50 bg-surface/60 p-4">
                              <div className="mb-3 flex items-center justify-between">
                                <div>
                                  <p className="text-[13px] font-bold">{week.title}</p>
                                  <p className="text-[10.5px] text-muted">{week.focus}</p>
                                </div>
                                <span className="text-[10px] font-semibold text-sub tnum">{fa(wDone)}/{fa(week.tasks.length)}</span>
                              </div>
                              <ProgressBar progress={week.tasks.length ? wDone / week.tasks.length : 0} color={color} height={5} className="mb-3" />
                              <div className="space-y-1">
                                {week.tasks.map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => togglePlanTask(plan.id, t.id)}
                                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-right transition-colors hover:bg-white/[0.02]"
                                  >
                                    <span
                                      className={cx(
                                        "grid h-5.5 w-5.5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                        t.done ? "border-primary bg-primary" : "border-border"
                                      )}
                                    >
                                      {t.done && <Check className="h-3 w-3 text-[#05130D]" strokeWidth={3.4} />}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className={cx("block text-[12.5px] font-semibold", t.done && "text-sub line-through decoration-border")}>{t.title}</span>
                                      <span className="block text-[10px] text-muted">{t.hint}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 rounded-2xl border border-border/50 bg-surface/60 p-4 text-center text-[11px] leading-5 text-sub">
        پلن‌ها پیشنهادی و کلی هستند؛ برای برنامه‌ی تخصصی با متخصص تغذیه مشورت کن.
      </p>
    </PageBody>
  );
}
