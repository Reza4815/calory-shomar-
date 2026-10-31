"use client";

import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { fa } from "@/lib/format";
import { cx } from "@/lib/cx";

/* ---------- Animated number (Persian digits) ---------- */

export function AnimatedNumber({
  value,
  className,
  digits = 0,
}: {
  value: number;
  className?: string;
  digits?: number;
}) {
  const reduce = useReducedMotion();
  const spring = useSpring(0, { stiffness: 90, damping: 22 });
  useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [value, reduce, spring]);
  const text = useTransform(spring, (v) => fa(v, digits));
  return <motion.span className={className}>{text}</motion.span>;
}

/* ---------- Card ---------- */

export function Card({
  children,
  className,
  onClick,
  glow,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: "green" | "blue";
}) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "relative rounded-[28px] border border-white/[0.03] bg-[#16181c]",
        glow === "green" && "shadow-[0_0_44px_rgba(32,201,138,0.10)]",
        glow === "blue" && "shadow-[0_0_44px_rgba(85,153,242,0.10)]",
        onClick && "cursor-pointer transition-transform active:scale-[0.985]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------- Icon badge ---------- */

const TINTS: Record<string, string> = {
  green: "rgba(32, 201, 138, 0.14)",
  blue: "rgba(85, 153, 242, 0.14)",
  purple: "rgba(155, 120, 232, 0.16)",
  orange: "rgba(242, 169, 75, 0.15)",
  red: "rgba(241, 107, 104, 0.15)",
  sub: "rgba(155, 163, 174, 0.12)",
};

const TINT_TEXT: Record<string, string> = {
  green: "#20C98A",
  blue: "#5599F2",
  purple: "#9B78E8",
  orange: "#F2A94B",
  red: "#F16B68",
  sub: "#9BA3AE",
};

export type Tone = keyof typeof TINTS;

export function IconBadge({
  icon,
  tone = "green",
  size = 44,
  iconSize = 20,
  className,
}: {
  icon: ReactNode;
  tone?: Tone;
  size?: number;
  iconSize?: number;
  className?: string;
}) {
  return (
    <div
      className={cx("grid shrink-0 place-items-center rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: TINTS[tone],
        color: TINT_TEXT[tone],
      }}
    >
      <span
        style={{ display: "grid", placeItems: "center" }}
        data-size={iconSize}
      >
        {icon}
      </span>
    </div>
  );
}

/* ---------- Progress Components ---------- */

export function ProgressRing({
  size = 88,
  stroke = 8,
  progress,
  color = "#20C98A",
  track = "rgba(48, 55, 68, 0.55)",
  children,
}: any) {
  const reduce = useReducedMotion();
  const p = Math.min(1, Math.max(0, progress));
  const r = (size - stroke) / 2;
  const c = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${c} ${c})`}>
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={track}
            strokeWidth={stroke}
          />
          <motion.circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100 100"
            initial={false}
            animate={{ strokeDashoffset: 100 * (1 - p) }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 60, damping: 18 }
            }
            style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
          />
        </g>
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProgressArc({
  size = 220,
  stroke = 14,
  progress,
  color = "#20C98A",
  track = "rgba(48, 55, 68, 0.5)",
}: any) {
  const reduce = useReducedMotion();
  const p = Math.min(1, Math.max(0, progress));
  const r = (size - stroke) / 2 - 4;
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(144 ${c} ${c})`}>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="70 100"
        />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="70 100"
          initial={false}
          animate={{ strokeDashoffset: 70 * (1 - p) }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 55, damping: 19 }
          }
          style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
        />
      </g>
    </svg>
  );
}

export function ProgressBar({
  progress,
  color = "#20C98A",
  className,
  height = 8,
}: any) {
  const reduce = useReducedMotion();
  const p = Math.min(1, Math.max(0, progress)) * 100;
  return (
    <div
      className={cx("w-full overflow-hidden rounded-full", className)}
      style={{ height, background: "rgba(48, 55, 68, 0.55)" }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={false}
        animate={{ width: `${p}%` }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 80, damping: 20 }
        }
        style={{ background: color, boxShadow: `0 0 12px ${color}66` }}
      />
    </div>
  );
}

/* ---------- Buttons & Inputs ---------- */

export function RoundButton({
  onClick,
  icon,
  tone = "green",
  size = 44,
  label,
}: any) {
  const reduce = useReducedMotion();
  const styles: Record<string, React.CSSProperties> = {
    green: {
      background: "#20C98A",
      color: "#05130D",
      boxShadow: "0 6px 20px rgba(32,201,138,0.35)",
    },
    blue: {
      background: "#5599F2",
      color: "#061018",
      boxShadow: "0 6px 20px rgba(85,153,242,0.35)",
    },
    purple: {
      background: "#A78BFA",
      color: "#171226",
      boxShadow: "0 6px 20px rgba(167,139,250,0.35)",
    },
    sub: {
      background: "#202631",
      color: "#9BA3AE",
      border: "1px solid #303744",
    },
    outline: {
      background: "transparent",
      color: "#9BA3AE",
      border: "1px solid #303744",
    },
  };
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.86 }}
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, ...styles[tone] }}
    >
      {icon}
    </motion.button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className,
  tone = "green",
  disabled,
}: any) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={cx(
        "w-full rounded-full py-3.5 text-[15px] font-bold transition-opacity disabled:opacity-50",
        tone === "green"
          ? "bg-primary text-[#05130D] shadow-[0_8px_24px_rgba(32,201,138,0.30)]"
          : "bg-blue text-[#061018] shadow-[0_8px_24px_rgba(85,153,242,0.30)]",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function SectionTitle({ title, badge, action }: any) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-[17px] font-bold">{title}</h2>
        {badge && (
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ---------- Page body (Full Screen + Ambient Glow + PWA Safe Area) ---------- */

export function PageBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.main
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      // حذف max-w برای فول اسکرین شدن در وب
      className={cx(
        "relative w-full min-h-screen bg-[#0b0c10] overflow-hidden pb-36 pt-[env(safe-area-inset-top)]",
        className,
      )}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden transform-gpu"
      >
        <div className="absolute -top-40 -right-20 h-[400px] w-[400px] rounded-full bg-[#00d287] opacity-15 blur-[120px] will-change-transform" />
        <div className="absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-[#ff3b30] opacity-15 blur-[120px] will-change-transform" />
        <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[#b072ff] opacity-20 blur-[120px] will-change-transform" />
      </div>

      {/* محتوا با پدینگ داخلی تا از لبه‌ها فاصله بگیرد */}
      <div className="relative z-10 px-4">{children}</div>
    </motion.main>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <IconBadge icon={icon} tone="sub" size={56} />
      <p className="mt-3 text-sm font-semibold text-sub">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function Segmented({
  id,
  options,
  value,
  onChange,
  accent = "#20C98A",
  size = "md",
  className,
}: any) {
  return (
    <div className={cx("flex rounded-full bg-surface p-1", className)}>
      {options.map((o: any) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cx(
              "relative flex-1 whitespace-nowrap rounded-full font-medium transition-colors",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-3 py-2.5 text-sm",
              active ? "text-[#05130D]" : "text-sub",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full"
                style={{ background: accent }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className={cx("relative z-10", active && "font-bold")}>
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
