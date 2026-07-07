"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CircleDot, Command } from "lucide-react";
import type { RoleConfig } from "./sidebarConfig";
import { buildHref, ROLES_ORDERED, ROLE_CONFIGS } from "./sidebarConfig";
import { resolveIcon } from "./iconMap";

export function Sidebar({
  config,
  onOpenCommand,
}: {
  config: RoleConfig;
  onOpenCommand: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 py-5">
      {/* ── Wordmark ── */}
      <div className="flex items-center gap-3 px-2">
        {/* DoorwayMark */}
        <div
          className="relative overflow-hidden"
          style={{
            width: 34,
            height: 34,
            borderRadius: 34 * 0.52,
            background: "#F9D96A",
          }}
        >
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 34 * 0.42, background: "#F9D96A" }}
          />
        </div>
        <div>
          <div className="font-serif text-xl tracking-[0.18em] text-[#111111]">
            CASA
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-stone-500">
            Intelligence Layer
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="mt-10 flex-1 space-y-1 overflow-y-auto">
        {config.sidebar.map((item, idx) => {
          const href = buildHref(config.role, item.href);
          const isActive =
            item.href === ""
              ? pathname === `/workspace/${config.role}`
              : pathname === href || pathname.startsWith(`${href}/`);
          const Icon = resolveIcon(item.icon);

          return (
            <Link key={`${item.label}-${idx}`} href={href} className="block">
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#F9D96A]/70 text-[#111111]"
                    : "text-stone-600 hover:bg-stone-100/80 hover:text-[#111111]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {isActive && <CircleDot className="h-3.5 w-3.5" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Live Swarm card ── */}
      <div className="mt-6 rounded-3xl border border-stone-200 bg-[#fffdf6] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500">
          <Command className="h-3.5 w-3.5" /> Live Swarm
        </div>
        <div className="text-sm leading-6 text-stone-700">
          4 agents monitoring market, debt, zoning, and risk signals.
        </div>
      </div>

      {/* ── Switch Role ── */}
      <div className="mt-4">
        <div className="mb-2 px-1 text-[10px] uppercase tracking-[0.2em] text-stone-400">
          Switch Role
        </div>
        <ul className="space-y-0.5">
          {ROLES_ORDERED.filter((r) => r !== config.role).map((r) => {
            const rc = ROLE_CONFIGS[r];
            const code = r.slice(0, 3).toUpperCase();
            return (
              <li key={r}>
                <Link href={buildHref(r, "")} className="block">
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100/80 hover:text-[#111111]"
                  >
                    <span className="w-8 text-[10px] font-medium tracking-[0.14em] text-stone-400">
                      {code}
                    </span>
                    <span>{rc.displayName}</span>
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Command palette trigger ── */}
      <div className="mt-3 border-t border-stone-200/80 pt-3">
        <button
          onClick={onOpenCommand}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-500 transition-colors hover:bg-stone-100/80 hover:text-[#111111]"
        >
          <Command className="h-3.5 w-3.5" />
          <span>Command palette</span>
          <kbd className="ml-auto text-[10px] tracking-wider text-stone-400">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
}
