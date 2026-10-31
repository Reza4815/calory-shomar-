"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/** Sticky sub-screen header with RTL back button (physical right). */
export function ScreenHeader({
  title,
  subtitle,
  end,
}: {
  title: string;
  subtitle?: string;
  end?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="frame-fixed top-0 z-30 border-b border-border/50 bg-bg/85 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button
          type="button"
          aria-label="بازگشت"
          onClick={() => router.back()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/70 bg-card text-sub transition-colors active:text-text"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-sub">{subtitle}</p>}
        </div>
        {end}
      </div>
    </header>
  );
}

/** Spacer matching the sticky header height for sub-screens */
export function HeaderSpacer() {
  return <div style={{ height: 68 }} />;
}
