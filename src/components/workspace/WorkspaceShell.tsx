"use client";

import { useEffect, useState } from "react";
import type { RoleConfig } from "./sidebarConfig";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";

export function WorkspaceShell({
  config,
  children,
}: {
  config: RoleConfig;
  children: React.ReactNode;
}) {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className="min-h-screen bg-[#FAFAF7] text-[#111111] antialiased"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      <div className="flex">
        {/* ── Sidebar: fixed 248px ── */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] border-r border-stone-200/80 bg-[#FAFAF7] lg:block">
          <Sidebar config={config} onOpenCommand={() => setCommandOpen(true)} />
        </aside>

        {/* ── Main content area ── */}
        <div className="min-w-0 flex-1 lg:pl-[248px]">
          {/* Sticky header */}
          <header className="sticky top-0 z-10 h-12 border-b border-stone-200/70 bg-[rgba(250,250,247,0.92)] backdrop-blur-xl">
            <Topbar
              config={config}
              onOpenCommand={() => setCommandOpen(true)}
            />
          </header>

          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        config={config}
      />
    </div>
  );
}
