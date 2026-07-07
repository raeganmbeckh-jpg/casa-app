"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TOKENS
   ═══════════════════════════════════════════════════════════════════ */

const INK = "#111111";
const CREAM = "#FAFAF7";
const HAIRLINE = "rgba(17,17,17,0.08)";
const BUTTER = "#F9D96A";
const DIM = "rgba(17,17,17,0.45)";
const MID = "rgba(17,17,17,0.65)";

const NAV_ITEMS = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/statements", label: "Statements", icon: FileText },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: CREAM }}>
      {/* ── Top bar ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#FFFFFF",
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/owner" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 22,
                fontWeight: 600,
                color: INK,
                letterSpacing: "-0.02em",
              }}
            >
              CASA
            </span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                color: MID,
              }}
            >
              Margaret Chen
            </span>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                color: DIM,
              }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 120px" }}>
        {children}
      </main>

      {/* ── Bottom nav ── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#FFFFFF",
          borderTop: `1px solid ${HAIRLINE}`,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: 48,
            padding: "0 24px",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "12px 16px",
                    position: "relative",
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="owner-nav-indicator"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: BUTTER,
                        borderRadius: "0 0 2px 2px",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={20} color={active ? INK : DIM} />
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      color: active ? INK : DIM,
                    }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
