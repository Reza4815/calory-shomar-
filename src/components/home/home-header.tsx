"use client";

import { Leaf } from "lucide-react";
import { faDigits, greeting } from "@/lib/format";
import { useProfileStore } from "@/stores";

export function HomeHeader() {
  const name = useProfileStore((s) => s.profile.name);
  const now = new Date();

  const day = faDigits(String(now.getDate()));
  const month = new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(now);
  const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(now);

  return (
    <header className="flex h-[70px] items-center justify-between gap-3">
      {/* Brand + greeting on the right (RTL start) */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #2ADE96 0%, #128A5F 100%)",
            boxShadow: "0 0 22px rgba(32, 201, 138, 0.35), 0 4px 14px rgba(0, 0, 0, 0.35)",
          }}
        >
          <Leaf className="h-5 w-5 text-[#05130D]" strokeWidth={2.4} fill="#05130D" fillOpacity={0.25} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-sub">{greeting(now)}</p>
          <p className="mt-0.5 truncate text-[17px] font-bold leading-tight text-text">
            {name.split(" ")[0]}
          </p>
        </div>
      </div>

      {/* Circular date indicator on the left (RTL end) */}
      <div
        className="relative grid h-[46px] w-[46px] shrink-0 flex-col place-items-center rounded-full border border-border/70 bg-card"
        title={faDigits(new Intl.DateTimeFormat("fa-IR", { dateStyle: "full" }).format(now))}
        aria-label={`${weekday} ${day} ${month}`}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.06] to-transparent" />
        <span className="relative -mt-0.5 text-[15px] font-bold leading-none tnum">{day}</span>
        <span className="relative text-[9px] font-medium leading-none text-sub">{month}</span>
      </div>
    </header>
  );
}
