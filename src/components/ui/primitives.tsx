"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
// CASA Design Primitives — extracted from /prototype
// ONE source of truth. Every workspace page imports from here.
// ═══════════════════════════════════════════════════════════════

// ── Tokens ────────────────────────────────────────────────────
export const T = {
  cream: "#FAFAF7",
  ink: "#111111",
  yellow: "#F9D96A",
  cardBg: "#fffdf8",
  cardBgAlt: "#fffdf6",
  border: "rgba(168,162,158,0.3)",    // stone-200-ish
  borderLight: "rgba(168,162,158,0.2)",
  dim: "rgba(120,113,108,1)",          // stone-500
  mid: "rgba(87,83,78,1)",            // stone-600
  red: "#B91C1C",
  green: "#15803D",
  shadow: "0 1px 3px rgba(168,162,158,0.15)",
} as const;

// ── Page Title ────────────────────────────────────────────────
export function PageTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <p
        className="text-xs uppercase tracking-[0.26em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {eyebrow}
      </p>
      <h1
        className="mt-4 max-w-3xl text-5xl leading-[0.95] tracking-tight text-stone-900 md:text-6xl"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Section Label ─────────────────────────────────────────────
export function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="text-xs uppercase tracking-[0.22em] text-stone-500"
      style={{ fontFamily: "var(--font-geist-mono)" }}
    >
      {children}
    </p>
  );
}

// ── Card ──────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] shadow-sm shadow-stone-200/40 ${padded ? "p-8" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Dark Statement Card ───────────────────────────────────────
export function DarkStatCard({
  label,
  value,
  subtitle,
  progress,
  icon,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  progress?: number; // 0-100
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[2.5rem] border border-stone-200 bg-[#111111] p-7 text-[#FAFAF7] shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
          {label}
        </p>
        {icon}
      </div>
      <div className="mt-10 text-8xl font-semibold tracking-[-0.08em]">
        {value}
      </div>
      {progress !== undefined && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: T.yellow }}
          />
        </div>
      )}
      {subtitle && (
        <p className="mt-6 text-sm leading-7 text-stone-300">{subtitle}</p>
      )}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────
export function KpiCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-stone-200 bg-[#fffdf8] p-5 shadow-sm shadow-stone-200/40"
    >
      <div
        className="text-xs uppercase tracking-[0.18em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </div>
      <div className="mt-4 text-3xl font-medium tracking-tight text-[#111111]">
        {value}
      </div>
      {note && (
        <div className="mt-2 text-sm leading-6 text-stone-600">{note}</div>
      )}
    </motion.div>
  );
}

// ── Pill Button ───────────────────────────────────────────────
export function PillButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
}) {
  const base = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-[#111111] text-[#FAFAF7] hover:scale-[1.01] shadow-sm"
      : "border border-stone-200 bg-[#fffdf8] text-stone-700 hover:border-stone-400";

  return (
    <motion.button
      whileHover={{ scale: variant === "primary" ? 1.01 : 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ── List Container (rounded-3xl) ──────────────────────────────
export function ListContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] shadow-sm shadow-stone-200/40 ${className}`}
    >
      {children}
    </div>
  );
}

// ── List Header ───────────────────────────────────────────────
export function ListHeader({
  label,
  action,
}: {
  label: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <SectionLabel>{label}</SectionLabel>
      {action}
    </div>
  );
}

// ── List Row ──────────────────────────────────────────────────
export function ListRow({
  children,
  onClick,
  last,
}: {
  children: ReactNode;
  onClick?: () => void;
  last?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      className={`flex items-center justify-between rounded-3xl border border-stone-200 bg-[#FAFAF7] p-4 ${
        onClick ? "cursor-pointer" : ""
      } ${last ? "" : "mb-2"}`}
    >
      {children}
    </motion.div>
  );
}

// ── Status Dot ────────────────────────────────────────────────
export function StatusDot({ color = T.yellow }: { color?: string }) {
  return (
    <span
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

// ── Yellow Wash Badge ─────────────────────────────────────────
export function YellowBadge({ children }: { children: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: "rgba(249,217,106,0.2)", color: "#92700C" }}
    >
      {children}
    </span>
  );
}

// ── Stagger container ─────────────────────────────────────────
export function StaggerIn({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

// ── Icon Chip (yellow wash) ───────────────────────────────────
export function IconChip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#F9D96A]/75 p-2">{children}</div>
  );
}
