"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import type { RoleConfig } from "./sidebarConfig";
import { buildHref, ROLES_ORDERED, ROLE_CONFIGS } from "./sidebarConfig";

const INK = "#111111";
const HAIRLINE = "rgba(17,17,17,0.08)";
const BUTTER = "#F9D96A";
const DIM = "rgba(17,17,17,0.45)";
const MID = "rgba(17,17,17,0.65)";

type PaletteItem = {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "current" | "switch";
  roleCode: string;
};

export function CommandPalette({
  open,
  onClose,
  config,
}: {
  open: boolean;
  onClose: () => void;
  config: RoleConfig;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const items: PaletteItem[] = useMemo(() => {
    const currentRoleCode = config.role.slice(0, 3).toUpperCase();
    const current: PaletteItem[] = config.sidebar.map((s) => ({
      id: `current-${s.href}`,
      label: s.label,
      hint:
        s.href === ""
          ? `${config.displayName} / Dashboard`
          : `${config.displayName} / ${s.label}`,
      href: buildHref(config.role, s.href),
      group: "current",
      roleCode: currentRoleCode,
    }));
    const switchItems: PaletteItem[] = ROLES_ORDERED.filter(
      (r) => r !== config.role
    ).map((r) => {
      const rc = ROLE_CONFIGS[r];
      return {
        id: `switch-${r}`,
        label: `Go to ${rc.displayName}`,
        hint: rc.tagline,
        href: buildHref(r, ""),
        group: "switch",
        roleCode: r.slice(0, 3).toUpperCase(),
      };
    });
    return [...current, ...switchItems];
  }, [config]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const haystack = `${it.label} ${it.hint} ${it.roleCode}`.toLowerCase();
      if (haystack.includes(q)) return true;
      let i = 0;
      for (const ch of haystack) {
        if (ch === q[i]) i++;
        if (i === q.length) return true;
      }
      return false;
    });
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (selected >= filtered.length) setSelected(Math.max(0, filtered.length - 1));
  }, [filtered, selected]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(filtered.length - 1, s + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(0, s - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[selected];
        if (item) {
          router.push(item.href);
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, selected, router, onClose]);

  const currentGroup = filtered.filter((i) => i.group === "current");
  const switchGroup = filtered.filter((i) => i.group === "switch");

  const orderedIds = filtered.map((i) => i.id);
  const isSelected = (id: string) => orderedIds[selected] === id;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          style={{ backgroundColor: "rgba(17,17,17,0.18)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="w-full max-w-[560px] mx-4 overflow-hidden"
            style={{
              backgroundColor: "#FAFAF7",
              border: `1px solid ${HAIRLINE}`,
              boxShadow: "0 24px 60px -20px rgba(17,17,17,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-3 px-4 h-12 border-b"
              style={{ borderColor: HAIRLINE }}
            >
              <Search size={14} strokeWidth={1.75} style={{ color: MID }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search workspace..."
                className="flex-1 bg-transparent outline-none text-[13px]"
                style={{ color: INK, fontFamily: "var(--font-inter)" }}
              />
              <kbd
                className="text-[9px] tracking-wider tabular-nums px-1.5 py-0.5"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  color: DIM,
                  backgroundColor: "rgba(17,17,17,0.04)",
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[420px] overflow-y-auto py-1">
              {filtered.length === 0 && (
                <div
                  className="px-4 py-6 text-[12px] italic"
                  style={{ fontFamily: "var(--font-heading)", color: MID }}
                >
                  No matches.
                </div>
              )}

              {currentGroup.length > 0 && (
                <div className="pt-1">
                  <div
                    className="px-4 py-1.5 text-[9px] tracking-[0.16em]"
                    style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}
                  >
                    {config.displayName.toUpperCase()}
                  </div>
                  {currentGroup.map((it) => (
                    <PaletteRow
                      key={it.id}
                      item={it}
                      selected={isSelected(it.id)}
                      onHover={() => setSelected(orderedIds.indexOf(it.id))}
                      onSelect={() => {
                        router.push(it.href);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}

              {switchGroup.length > 0 && (
                <div className="pt-1">
                  <div
                    className="px-4 py-1.5 text-[9px] tracking-[0.16em] border-t"
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      color: DIM,
                      borderColor: HAIRLINE,
                    }}
                  >
                    SWITCH ROLE
                  </div>
                  {switchGroup.map((it) => (
                    <PaletteRow
                      key={it.id}
                      item={it}
                      selected={isSelected(it.id)}
                      onHover={() => setSelected(orderedIds.indexOf(it.id))}
                      onSelect={() => {
                        router.push(it.href);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-3 px-4 h-8 border-t text-[10px]"
              style={{
                borderColor: HAIRLINE,
                color: DIM,
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              <span className="tracking-[0.14em]">&#x2191;&#x2193; MOVE</span>
              <span className="tracking-[0.14em]">&#x21B5; OPEN</span>
              <span className="tracking-[0.14em]">ESC CLOSE</span>
              <span className="ml-auto tracking-[0.14em]">
                {filtered.length} {filtered.length === 1 ? "RESULT" : "RESULTS"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaletteRow({
  item,
  selected,
  onHover,
  onSelect,
}: {
  item: PaletteItem;
  selected: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 h-9 text-left transition-colors"
      style={{
        backgroundColor: selected ? "rgba(249,217,106,0.12)" : "transparent",
      }}
    >
      <span
        className="w-[2px] h-4"
        style={{ backgroundColor: selected ? BUTTER : "transparent" }}
      />
      <span
        className="text-[9px] w-7 tracking-[0.14em]"
        style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}
      >
        {item.roleCode}
      </span>
      <span
        className="text-[12px]"
        style={{
          color: INK,
          fontFamily: "var(--font-inter)",
          fontWeight: selected ? 500 : 400,
        }}
      >
        {item.label}
      </span>
      <span
        className="text-[10px] italic ml-1"
        style={{ color: MID, fontFamily: "var(--font-heading)" }}
      >
        {item.hint}
      </span>
      <ArrowRight
        size={11}
        strokeWidth={1.75}
        className="ml-auto"
        style={{ color: selected ? INK : DIM }}
      />
    </button>
  );
}
