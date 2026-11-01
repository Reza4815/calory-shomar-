"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
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
  end?: ReactNode; // پراپ end دوباره اضافه شد
}) {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 w-full flex justify-center bg-[#0b0c10]/80 backdrop-blur-md border-b border-white/5">
      <div className="w-full max-w-md px-4 py-4 flex items-center justify-between">
        {/* دکمه بازگشت */}
        <button
          onClick={() => (href ? router.push(href) : router.back())}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white transition-colors hover:bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* متن‌ها */}
        <div className="text-center flex-1">
          <h1 className="text-[17px] font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-[#8b8e98]">{subtitle}</p>
          )}
        </div>

        {/* بخش سمت چپ (اگر end داده شود، آن را نمایش می‌دهد، در غیر این صورت فضای خالی) */}
        <div className="w-10 h-10 flex items-center justify-center">
          {end || null}
        </div>
      </div>
    </header>
  );
}

export function HeaderSpacer() {
  return <div className="h-[76px] w-full" />;
}
