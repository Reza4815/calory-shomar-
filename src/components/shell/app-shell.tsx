"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, type ReactNode } from "react";
import { useHydrated, useMounted } from "@/stores";
import { Toasts } from "@/components/ui/toasts";
import { BottomNav } from "./bottom-nav";

function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}

export function Splash() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex h-[100dvh] flex-col items-center justify-center bg-[#0b0c10]"
      exit={{ opacity: 0, scale: reduce ? 1 : 1.03 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.div
        animate={reduce ? {} : { scale: [1, 1.07, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid place-items-center"
      >
        <div className="absolute h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
        <Image
          src="/icons/icon-512.png"
          alt="رفا"
          width={84}
          height={84}
          className="relative rounded-[26px] shadow-[0_0_50px_rgba(32,201,138,0.30)]"
          priority
        />
      </motion.div>
      <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-white">
        رفا
      </h1>
      <p className="mt-2 text-sm text-sub">سلامت و سبک زندگی، هر روز</p>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={reduce ? {} : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const hydrated = useHydrated();
  const ready = mounted && hydrated;

  return (
    <div className="relative flex flex-col min-h-[100dvh] bg-[#0b0c10] overflow-x-hidden">
      {/* گلوهای ثابت پس‌زمینه */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* گلو سبز - سمت راست (بالا) - پررنگ‌تر */}
        <div className="absolute -top-20 -right-10 h-[250px] w-[250px] rounded-full bg-[#00d287] opacity-25 blur-[90px]" />

        {/* گلو آبی - سمت چپ (بالا) */}
        <div className="absolute -top-20 -left-10 h-[250px] w-[250px] rounded-full bg-[#1d4ed8] opacity-10 blur-[90px]" />

        {/* گلو قرمز */}
        <div className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-[#ff3b30] opacity-15 blur-[120px]" />

        {/* گلو بنفش */}
        <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[#b072ff] opacity-20 blur-[120px]" />
      </div>

      {ready && (
        <main
          className="relative z-10 flex-1 flex flex-col w-full"
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
          }}
        >
          {children}
        </main>
      )}

      <BottomNav />
      <Toasts />
      <AnimatePresence>{!ready && <Splash key="splash" />}</AnimatePresence>
      <ServiceWorkerRegister />
    </div>
  );
}
