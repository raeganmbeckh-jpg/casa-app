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
      className="min-h-screen antialiased"
      style={{
        backgroundColor: "#FAFAF7",
        color: "#111111",
        fontFamily: "var(--font-inter)",
      }}
    >
      <div
        className="fixed inset-x-0 top-0 z-30 h-px"
        style={{ backgroundColor: "rgba(17,17,17,0.08)" }}
      />

      <div className="grid min-h-screen grid-cols-[220px_1fr]">
        <aside
          className="fixed inset-y-0 left-0 z-20 w-[220px] border-r"
          style={{
            backgroundColor: "#FAFAF7",
            borderColor: "rgba(17,17,17,0.08)",
          }}
        >
          <Sidebar config={config} onOpenCommand={() => setCommandOpen(true)} />
        </aside>

        <div className="col-start-2 flex min-h-screen flex-col">
          <header
            className="sticky top-0 z-10 h-12 border-b backdrop-blur"
            style={{
              backgroundColor: "rgba(250,250,247,0.92)",
              borderColor: "rgba(17,17,17,0.08)",
            }}
          >
            <Topbar config={config} onOpenCommand={() => setCommandOpen(true)} />
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
