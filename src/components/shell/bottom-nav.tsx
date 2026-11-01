"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ChefHat,
  Home,
  UserRound,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { haptic } from "@mxerf/tappt"; // ایمپورت ویبره
import { cx } from "@/lib/cx";
import { FabMenu } from "./fab-menu";

const ITEMS = [
  { href: "/", label: "خانه", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/plans",
    label: "برنامه",
    icon: UtensilsCrossed,
    match: (p: string) => p.startsWith("/plans"),
  },
  {
    href: "/recipes",
    label: "دستور پخت",
    icon: ChefHat,
    match: (p: string) => p.startsWith("/recipes"),
  },
  {
    href: "/meals",
    label: "وعده‌ها",
    icon: Utensils,
    match: (p: string) => p.startsWith("/meals"),
  },
  {
    href: "/profile",
    label: "پروفایل",
    icon: UserRound,
    match: (p: string) => p.startsWith("/profile"),
  },
];

// کامپوننت داخلی برای مدیریت ویبره روی لینک‌ها
function NavItem({
  item,
  pathname,
  reduce,
}: {
  item: any;
  pathname: string;
  reduce: boolean | null;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const active = item.match(pathname);
  const Icon = item.icon;

  useEffect(() => {
    if (ref.current) {
      // این خط باعث میشه لینک‌ها روی آیفون ویبره بزنن
      const detach = haptic.attach(ref.current, { kind: "selection" });
      return () => detach();
    }
  }, []);

  return (
    <Link
      ref={ref}
      href={item.href}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2"
      onClick={() => haptic.selection()}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-full bg-elevated ring-1 ring-primary/30"
          style={{ boxShadow: "0 0 20px rgba(32,201,138,0.16)" }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 32 }
          }
        />
      )}
      <Icon
        className={cx(
          "relative z-10 h-[21px] w-[21px] transition-colors",
          active ? "text-primary" : "text-muted",
        )}
        strokeWidth={active ? 2.4 : 2}
      />
      <span
        className={cx(
          "relative z-10 text-[10px] transition-colors",
          active ? "font-bold text-primary" : "font-medium text-muted",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [isHidden, setIsHidden] = useState(false);

  // گوش دادن به رویداد باز/بسته شدن شیت‌ها برای مخفی کردن نوار
  useEffect(() => {
    const handleToggle = (e: any) => setIsHidden(e.detail.hide);
    window.addEventListener("toggle-bottom-nav", handleToggle);
    return () => window.removeEventListener("toggle-bottom-nav", handleToggle);
  }, []);

  return (
    <nav
      aria-label="ناوبری اصلی"
      className={cx(
        "fixed inset-x-0 bottom-0 z-40 w-full flex justify-center pointer-events-none transition-all duration-300",
        isHidden ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0",
      )}
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex w-full max-w-[430px] items-center gap-3 px-4 pointer-events-auto">
        <FabMenu />

        <div className="flex flex-1 items-center rounded-full border border-border/70 bg-card/85 p-1.5 shadow-[0_14px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              pathname={pathname}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
