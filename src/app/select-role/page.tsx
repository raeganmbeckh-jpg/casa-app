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

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Building2, TrendingUp, BarChart3, Home, Wrench, Search,
};

const Y = "#F9D96A";
const YD = "#E8C84A";
const TX = "#1A1A1A";
const TX2 = "#6B6B6B";
const BD = "#F0F0F0";
const GLOW = "0 8px 40px rgba(249,217,106,0.22)";

export default function RoleSelector() {
  const router = useRouter();

  function selectRole(roleId: string) {
    localStorage.setItem("casa-role", roleId);
    router.push("/workspace");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: "#fff" }}>
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 h-16 flex items-center" style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${BD}` }}>
        <a href="/" style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: TX, letterSpacing: -0.5, textDecoration: "none" }}>CASA</a>
      </div>

      <div className="text-center mb-14 pt-16">
        <h1 className="text-4xl sm:text-5xl mb-3" style={{ fontFamily: "var(--font-heading)", color: TX, fontWeight: 600 }}>
          Who do you want to be today?
        </h1>
        <p className="text-base" style={{ fontFamily: "var(--font-inter)", color: TX2 }}>
          Select a role to customize your workspace
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl w-full">
        {ROLES.map((role) => {
          const Icon = iconMap[role.icon];
          return (
            <button
              key={role.id}
              onClick={() => selectRole(role.id)}
              className="group flex flex-col items-start p-7 rounded-2xl border text-left transition-all duration-500 hover:-translate-y-1"
              style={{ borderColor: BD, backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = GLOW; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
            >
              <div
                className="p-3.5 rounded-xl mb-5 transition-all duration-500 group-hover:scale-110"
                style={{ backgroundColor: `${Y}30` }}
              >
                <Icon className="w-6 h-6" style={{ color: YD }} />
              </div>
              <h2 className="text-lg mb-1" style={{ fontFamily: "var(--font-heading)", color: TX, fontWeight: 700 }}>
                {role.label}
              </h2>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)", color: TX2 }}>
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </main>
  );
}
