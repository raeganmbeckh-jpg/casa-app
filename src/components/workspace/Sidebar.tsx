"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Command } from "lucide-react";
import type { RoleConfig } from "./sidebarConfig";
import { buildHref, ROLES_ORDERED, ROLE_CONFIGS } from "./sidebarConfig";

const INK = "#111111";
const HAIRLINE = "rgba(17,17,17,0.08)";
const BUTTER = "#F9D96A";
const DIM = "rgba(17,17,17,0.45)";
const MID = "rgba(17,17,17,0.65)";
const SOFT_HOVER = "rgba(17,17,17,0.035)";

export function Sidebar({
  config,
  onOpenCommand,
}: {
  config: RoleConfig;
  onOpenCommand: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex h-12 items-center border-b px-4"
        style={{ borderColor: HAIRLINE }}
      >
        <Link href="/" className="flex items-baseline gap-1.5" style={{ color: INK }}>
          <span
            className="text-[20px] leading-none"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            CASA
          </span>
          <span
            className="text-[8px] tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: DIM,
            }}
          >
            v1
          </span>
        </Link>
      </div>

      <div className="px-4 py-3 border-b" style={{ borderColor: HAIRLINE }}>
        <div
          className="text-[9px] tracking-[0.16em] mb-1"
          style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}
        >
          WORKSPACE
        </div>
        <div
          className="text-[15px] leading-tight"
          style={{
            fontFamily: "var(--font-heading)",
            color: INK,
            fontWeight: 500,
          }}
        >
          {config.displayName}
        </div>
        <div
          className="text-[10px] mt-0.5 italic"
          style={{ fontFamily: "var(--font-heading)", color: MID }}
        >
          {config.tagline}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <div
          className="px-4 pb-1.5 pt-2 text-[9px] tracking-[0.16em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}
        >
          NAVIGATION
        </div>
        <ul className="space-y-px px-2">
          {config.sidebar.map((item, idx) => {
            const href = buildHref(config.role, item.href);
            const isActive =
              item.href === ""
                ? pathname === `/workspace/${config.role}`
                : pathname === href || pathname.startsWith(`${href}/`);
            const Icon = item.icon;

            return (
              <li key={`${item.label}-${idx}`}>
                <Link href={href} className="block">
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="relative flex h-8 items-center gap-2.5 pl-3 pr-2"
                    style={{
                      backgroundColor: isActive
                        ? "rgba(249,217,106,0.10)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = SOFT_HOVER;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-flag"
                        className="absolute left-0 top-0 bottom-0 w-[2px]"
                        style={{ backgroundColor: BUTTER }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 32,
                        }}
                      />
                    )}

                    <Icon
                      size={13}
                      strokeWidth={isActive ? 2 : 1.5}
                      style={{ color: isActive ? INK : MID }}
                    />
                    <span
                      className="text-[12px] leading-none"
                      style={{
                        color: isActive ? INK : MID,
                        fontWeight: isActive ? 500 : 400,
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="ml-auto text-[9px] px-1 tabular-nums"
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          color: INK,
                          backgroundColor: BUTTER,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className="mt-4 px-4 pb-1.5 pt-3 border-t text-[9px] tracking-[0.16em]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: DIM,
            borderColor: HAIRLINE,
          }}
        >
          SWITCH ROLE
        </div>
        <ul className="space-y-px px-2">
          {ROLES_ORDERED.filter((r) => r !== config.role).map((r) => {
            const rc = ROLE_CONFIGS[r];
            const code = r.slice(0, 3).toUpperCase();
            return (
              <li key={r}>
                <Link href={buildHref(r, "")} className="block">
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex h-7 items-center gap-2.5 pl-3 pr-2"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = SOFT_HOVER;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span
                      className="text-[9px] tracking-[0.14em] w-7"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: DIM,
                      }}
                    >
                      {code}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: MID, fontFamily: "var(--font-inter)" }}
                    >
                      {rc.displayName}
                    </span>
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t px-3 py-2.5" style={{ borderColor: HAIRLINE }}>
        <button
          onClick={onOpenCommand}
          className="flex w-full items-center gap-2 px-2 py-1.5 transition-colors"
          style={{ backgroundColor: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = SOFT_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <Command size={11} strokeWidth={1.75} style={{ color: MID }} />
          <span
            className="text-[10px]"
            style={{ color: MID, fontFamily: "var(--font-inter)" }}
          >
            Command palette
          </span>
          <kbd
            className="ml-auto text-[9px] tracking-wider tabular-nums px-1"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: DIM,
              backgroundColor: "rgba(17,17,17,0.04)",
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}
