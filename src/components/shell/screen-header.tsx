"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ScreenHeader({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 w-full flex justify-center bg-[#0b0c10]/80 backdrop-blur-md border-b border-white/5">
      {/* این کانتینر باعث می‌شود هدر در دسکتاپ مثل بقیه صفحات وسط‌چین و محدود شود */}
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

        {/* فضای خالی برای توازن (هم‌اندازه با دکمه بازگشت) */}
        <div className="w-10 h-10" />
      </div>
    </header>
  );
}

export function HeaderSpacer() {
  // این فضا برای جلوگیری از رفتن محتوا زیر هدر ثابت است
  return <div className="h-[76px] w-full" />;
}
