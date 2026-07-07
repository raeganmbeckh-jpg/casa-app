"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { RoleConfig } from "./sidebarConfig";

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

  return (
    <div className="flex h-12 items-center justify-between gap-4 px-5 lg:px-8">
      {/* ── Left: search pill + breadcrumb ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-3 rounded-full border border-stone-200 bg-[#fffdf8] px-4 py-2 text-sm text-stone-500 shadow-sm shadow-stone-200/30 transition hover:border-stone-300"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">
            Search properties, markets, documents...
          </span>
          <span className="sm:hidden">Search...</span>
          <kbd className="ml-2 text-[10px] tracking-wider text-stone-400">
            ⌘K
          </kbd>
        </button>

        {/* Breadcrumb */}
        <nav className="hidden items-baseline gap-2 text-sm leading-none lg:flex">
          <span className="font-medium text-[#111111]">{crumbs[0]}</span>
          <span className="text-[11px] text-stone-400">▸</span>
          <span className="italic text-stone-500">{crumbs[1]}</span>
        </nav>
      </div>

      {/* ── Right: clock + "New Analysis" button ── */}
      <div className="flex items-center gap-4">
        {/* Live clock */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F9D96A] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F9D96A]" />
          </span>
          <span className="text-[10px] tabular-nums tracking-[0.14em] text-stone-500">
            UPD {now}
          </span>
        </div>

        {/* New Analysis pill */}
        <button className="rounded-full bg-[#111111] px-4 py-2 text-sm text-[#FAFAF7] shadow-sm transition hover:scale-[1.01]">
          New Analysis
        </button>
      </div>
    </div>
  );
}
