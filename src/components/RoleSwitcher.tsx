"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  TrendingUp,
  Layers,
  Handshake,
  Landmark,
  MapPin,
} from "lucide-react";
import { ROLES, type RoleId } from "@/lib/roles";

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2, TrendingUp, Layers, Handshake, Landmark, MapPin,
};

export default function RoleSwitcher({ currentRole }: { currentRole: RoleId }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  function switchRole(roleId: string) {
    localStorage.setItem("casa-role", roleId);
    if (roleId === currentRole) return;
    window.location.reload();
  }

  return (
    <>
      <style jsx global>{`
        @keyframes slideUpPill {
          from { opacity: 0; transform: translateX(-50%) translateY(40px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          padding: 6,
          display: "flex",
          alignItems: "center",
          gap: 2,
          animation: mounted ? "slideUpPill 0.6s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
          opacity: mounted ? undefined : 0,
        }}
      >
        {ROLES.map((role) => {
          const Icon = iconMap[role.icon];
          const active = role.id === currentRole;
          return (
            <button
              key={role.id}
              onClick={() => switchRole(role.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                fontFamily: "var(--font-inter)",
                backgroundColor: active ? "#F9D96A" : "transparent",
                color: active ? "#1A1A1A" : "#9B9B9B",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(249,217,106,0.15)";
                  (e.currentTarget as HTMLElement).style.color = "#1A1A1A";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#9B9B9B";
                }
              }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="hidden sm:inline">{role.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
