"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function ScreenHeader({
  title,
  subtitle,
  href,
  end,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  end?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex w-full items-start justify-between mb-5 mt-2">
      <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-sub">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {end && <div>{end}</div>}
        {(href || router) && (
          <button
            onClick={() => (href ? router.push(href) : router.back())}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white transition-colors hover:bg-white/10 shrink-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// دیگر نیازی به فاصله‌دهی نیست
export function HeaderSpacer() {
  return null;
}
