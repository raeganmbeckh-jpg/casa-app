"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  TrendingUp,
  BarChart3,
  Home,
  Wrench,
  Search,
} from "lucide-react";
import { ROLES, type RoleId } from "@/lib/roles";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2, TrendingUp, BarChart3, Home, Wrench, Search,
};

export default function RoleSwitcher({ currentRole }: { currentRole: RoleId }) {
  const router = useRouter();

  function switchRole(roleId: string) {
    localStorage.setItem("casa-role", roleId);
    if (roleId === currentRole) return;
    router.refresh();
    window.location.reload();
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 py-2" style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid #F0F0F0" }}>
      <div className="flex items-center justify-center gap-1 max-w-4xl mx-auto">
        {ROLES.map((role) => {
          const Icon = iconMap[role.icon];
          const active = role.id === currentRole;
          return (
            <button
              key={role.id}
              onClick={() => switchRole(role.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                fontFamily: "var(--font-inter)",
                backgroundColor: active ? "#F9D96A20" : "transparent",
                color: active ? "#E8C84A" : "#6B6B6B",
                border: active ? "1px solid #F9D96A30" : "1px solid transparent",
              }}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
