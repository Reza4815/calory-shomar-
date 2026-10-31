"use client";

import { RefreshCcw, WifiOff } from "lucide-react";
import { PageBody, PrimaryButton } from "@/components/ui/primitives";

export default function OfflinePage() {
  return (
    <PageBody className="flex min-h-dvh flex-col items-center justify-center text-center">
      <div
        className="grid h-20 w-20 place-items-center rounded-full"
        style={{ background: "rgba(155,163,174,0.12)", boxShadow: "0 0 40px rgba(0,0,0,0.3)" }}
      >
        <WifiOff className="h-8 w-8 text-muted" />
      </div>
      <h1 className="mt-6 text-xl font-extrabold">آفلاین هستی</h1>
      <p className="mt-2 max-w-60 text-sm leading-6 text-sub">
        اتصال اینترنت قطع است. داده‌های رفا روی دستگاهت ذخیره شده‌اند و با برگشتن اینترنت همه‌چیز در دسترسه.
      </p>
      <PrimaryButton className="mt-8 max-w-56" onClick={() => window.location.reload()}>
        <span className="inline-flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          دوباره تلاش کن
        </span>
      </PrimaryButton>
    </PageBody>
  );
}
