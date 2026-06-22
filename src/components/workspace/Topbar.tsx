// src/components/workspace/Topbar.tsx
// 48px sticky topbar — role badge, breadcrumb, live UPD pulse, ⌘K trigger.
// Cream substrate inherited from shell; this component only owns layout + content.

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { RoleConfig } from "./sidebarConfig";

const INK = "#111111";
const HAIRLINE = "rgba(17,17,17,0.08)";
const BUTTER = "#F9D96A";
const DIM = "rgba(17,17,17,0.45)";
const MID = "rgba(17,17,17,0.65)";

export function Topbar({
  config,
  onOpenCommand,
}: {
  config: RoleConfig;
  onOpenCommand: () => void;
}) {
  const pathname = usePathname();
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    function tick() {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setNow(`${hh}:${mm}:${ss}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const crumbs = (() => {
    const segments = pathname.split("/").filter(Boolean);
    const rest = segments.slice(2);
    if (rest.length === 0) {
      return [config.displayName, "Dashboard"];
    }
    const subHref = rest.join("/");
    const item = config.sidebar.find((s) => s.href === subHref);
    const label =
      item?.label ??
      rest
        .map((s) =>
          s
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")
        )
        .join(" / ");
    return [config.displayName, label];
  })();

  const roleCode = config.role.slice(0, 3).toUpperCase();

  return (
    <div className="flex h-12 items-center gap-4 px-4">
      <div
        className="flex h-6 items-center px-2 text-[10px] font-medium tracking-[0.12em]"
        style={{
          backgroundColor: BUTTER,
          color: INK,
          fontFamily: "var(--font-geist-mono)",
        }}
      >
        {roleCode}
      </div>

      <nav className="flex items-baseline gap-2 text-[15px] leading-none">
        <span
          style={{
            fontFamily: "var(--font-heading)",
            color: INK,
            fontWeight: 500,
          }}
        >
          {crumbs[0]}
        </span>
        <span style={{ color: DIM }} className="text-[11px]">
          ▸
        </span>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontStyle: "italic",
            color: MID,
            fontWeight: 400,
          }}
        >
          {crumbs[1]}
        </span>
      </nav>

      <div className="flex-1" />

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
          className="text-[10px] tracking-[0.14em] tabular-nums"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: MID,
          }}
        >
          UPD {now}
        </span>
      </div>

      <button
        onClick={onOpenCommand}
        className="group flex h-7 items-center gap-2 border px-2.5 transition-colors"
        style={{
          borderColor: HAIRLINE,
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(17,17,17,0.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = HAIRLINE;
        }}
      >
        <Search size={12} style={{ color: MID }} strokeWidth={1.75} />
        <span
          className="text-[11px]"
          style={{ color: MID, fontFamily: "var(--font-inter)" }}
        >
          Search
        </span>
        <kbd
          className="ml-2 flex h-4 items-center px-1.5 text-[9px] tracking-wider tabular-nums"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: DIM,
            backgroundColor: "rgba(17,17,17,0.04)",
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          ⌘K
        </kbd>
      </button>
    </div>
  );
}
