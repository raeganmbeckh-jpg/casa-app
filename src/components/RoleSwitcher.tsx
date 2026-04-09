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
  Building2,
  TrendingUp,
  BarChart3,
  Home,
  Wrench,
  Search,
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#0d0f1a] border-t border-[var(--border)] px-4 py-2 z-50">
      <div className="flex items-center justify-center gap-1 max-w-4xl mx-auto">
        {ROLES.map((role) => {
          const Icon = iconMap[role.icon];
          const active = role.id === currentRole;
          return (
            <button
              key={role.id}
              onClick={() => switchRole(role.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
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
