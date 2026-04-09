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
import { ROLES } from "@/lib/roles";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  TrendingUp,
  BarChart3,
  Home,
  Wrench,
  Search,
};

export default function RoleSelector() {
  const router = useRouter();

  function selectRole(roleId: string) {
    localStorage.setItem("casa-role", roleId);
    router.push("/workspace");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-3">CASA</h1>
        <p className="text-lg text-gray-400">
          Who do you want to be today?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {ROLES.map((role) => {
          const Icon = iconMap[role.icon];
          return (
            <button
              key={role.id}
              onClick={() => selectRole(role.id)}
              className="group flex flex-col items-start p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:border-blue-500/50 transition-all text-left"
            >
              <div
                className={`${role.color} p-3 rounded-lg mb-4 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold mb-1">{role.label}</h2>
              <p className="text-sm text-gray-400">{role.description}</p>
            </button>
          );
        })}
      </div>
    </main>
  );
}
