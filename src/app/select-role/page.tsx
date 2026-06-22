"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  ROLES_ORDERED,
  ROLE_CONFIGS,
  buildHref,
} from "@/components/workspace/sidebarConfig";

const INK = "#111111";
const CREAM = "#FAFAF7";
const HAIRLINE = "rgba(17,17,17,0.08)";
const BUTTER = "#F9D96A";
const DIM = "rgba(17,17,17,0.45)";
const MID = "rgba(17,17,17,0.65)";

export default function SelectRolePage() {
  return (
    <div
      className="min-h-screen antialiased"
      style={{
        backgroundColor: CREAM,
        color: INK,
        fontFamily: "var(--font-inter)",
      }}
    >
      <div
        className="fixed inset-x-0 top-0 z-30 h-px"
        style={{ backgroundColor: HAIRLINE }}
      />

      <header className="border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-[1280px] mx-auto px-8 h-12 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-baseline gap-1.5"
            style={{ color: INK }}
          >
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

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping opacity-60"
                style={{ backgroundColor: BUTTER, borderRadius: "9999px" }}
              />
              <span
                className="relative inline-flex h-2 w-2"
                style={{ backgroundColor: BUTTER, borderRadius: "9999px" }}
              />
            </span>
            <span
              className="text-[10px] tracking-[0.14em]"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: MID,
              }}
            >
              TERMINAL ONLINE
            </span>
          </div>
        </div>
      </header>

      <section className="border-b" style={{ borderColor: HAIRLINE }}>
        <div className="max-w-[1280px] mx-auto px-8 py-12">
          <div
            className="text-[10px] tracking-[0.18em] mb-4"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: DIM,
            }}
          >
            SELECT WORKSPACE / 06 ROLES
          </div>
          <h1
            className="text-[44px] leading-[1.05] tracking-[-0.015em] max-w-[820px]"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 500,
              color: INK,
            }}
          >
            Pick the seat you sit in.{" "}
            <span style={{ fontStyle: "italic", color: MID }}>
              Every role gets its own terminal.
            </span>
          </h1>
          <p
            className="mt-4 text-[13px] max-w-[640px]"
            style={{
              color: MID,
              fontFamily: "var(--font-inter)",
              lineHeight: 1.55,
            }}
          >
            CASA shapes itself around what you actually do — underwriting,
            leasing, building, lending, listing, scouting. Choose your role
            below to enter the workspace built for it.
          </p>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          style={{ borderLeft: `1px solid ${HAIRLINE}` }}
        >
          {ROLES_ORDERED.map((role, idx) => {
            const rc = ROLE_CONFIGS[role];
            const code = role.slice(0, 3).toUpperCase();
            const indexLabel = String(idx + 1).padStart(2, "0");
            return (
              <RoleCard
                key={role}
                href={buildHref(role, "")}
                code={code}
                indexLabel={indexLabel}
                displayName={rc.displayName}
                tagline={rc.tagline}
                description={rc.description}
                sidebarCount={rc.sidebar.length}
              />
            );
          })}
        </div>
      </section>

      <footer className="border-t mt-0" style={{ borderColor: HAIRLINE }}>
        <div
          className="max-w-[1280px] mx-auto px-8 h-10 flex items-center justify-between text-[10px] tracking-[0.14em]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: DIM,
          }}
        >
          <span>CASA / WORKSPACE ROUTER</span>
          <span>
            06 ROLES ·{" "}
            {Object.values(ROLE_CONFIGS).reduce(
              (n, r) => n + r.sidebar.length,
              0
            )}{" "}
            MODULES
          </span>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({
  href,
  code,
  indexLabel,
  displayName,
  tagline,
  description,
  sidebarCount,
}: {
  href: string;
  code: string;
  indexLabel: string;
  displayName: string;
  tagline: string;
  description: string;
  sidebarCount: number;
}) {
  return (
    <Link href={href} className="block">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="relative h-full px-7 py-7 cursor-pointer group"
        style={{
          borderRight: `1px solid ${HAIRLINE}`,
          borderBottom: `1px solid ${HAIRLINE}`,
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(249,217,106,0.04)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <span
            className="text-[10px] tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: DIM,
            }}
          >
            {indexLabel}
          </span>
          <span
            className="text-[10px] tracking-[0.14em] px-1.5 py-0.5"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: INK,
              backgroundColor: BUTTER,
            }}
          >
            {code}
          </span>
        </div>

        <div
          className="text-[26px] leading-[1.1] tracking-[-0.01em]"
          style={{
            fontFamily: "var(--font-heading)",
            color: INK,
            fontWeight: 500,
          }}
        >
          {displayName}
        </div>

        <div
          className="text-[13px] italic mt-1"
          style={{
            fontFamily: "var(--font-heading)",
            color: MID,
          }}
        >
          {tagline}
        </div>

        <div
          className="my-5 h-px"
          style={{ backgroundColor: HAIRLINE }}
        />

        <p
          className="text-[12px] leading-[1.55]"
          style={{
            color: MID,
            fontFamily: "var(--font-inter)",
          }}
        >
          {description}
        </p>

        <div className="mt-7 flex items-center justify-between">
          <span
            className="text-[9px] tracking-[0.16em] tabular-nums"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: DIM,
            }}
          >
            {String(sidebarCount).padStart(2, "0")} MODULES
          </span>
          <motion.span
            className="flex items-center gap-1.5 text-[10px] tracking-[0.14em]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: INK,
            }}
          >
            ENTER
            <ArrowUpRight
              size={12}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}
