"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Globe,
  Building2,
  TrendingUp,
  BarChart3,
  Wrench,
  Landmark,
  MapPin,
  ArrowRight,
  Shield,
  Brain,
  Users,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TOKENS
   ═══════════════════════════════════════════════════════════════════ */

const Y = "#F9D96A";       // butter yellow
const YD = "#E8C84A";      // hover
const YBG = "#FFFDF0";     // tint
const TX = "#1A1A1A";      // primary text
const TX2 = "#6B6B6B";     // secondary
const BD = "#F0F0F0";      // border
const GLOW = "0 8px 40px rgba(249,217,106,0.25)";
const GLOW_SM = "0 4px 20px rgba(249,217,106,0.18)";
const PF = "var(--font-heading)";
const IN = "var(--font-inter)";

/* ═══════════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Counter({ target, suffix = "", visible }: { target: number; suffix?: string; visible: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const dur = 2000;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(target * ease));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, target]);
  return <>{count}{suffix}</>;
}

/* ═══════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════ */

const FEATURES = [
  { icon: Globe, title: "Property Intelligence Terminal", desc: "Search any US address. Get owner, value, taxes, sale history, litigation status, and AI system health analysis in seconds." },
  { icon: Brain, title: "50 AI Agents Working Together", desc: "From predictive maintenance to eviction risk scoring to off-market deal sourcing. Agents that work while you sleep." },
  { icon: Users, title: "6 Role Workspaces", desc: "Switch between Manager, Investor, Broker, Developer, Lender, and Land Acquisition with one click." },
];

const STEPS = [
  { num: "01", title: "Search any address", desc: "ATTOM returns live property data — owner, value, taxes, sale history, systems, and more." },
  { num: "02", title: "AI agents analyze", desc: "50+ agents surface insights automatically — risk scores, maintenance alerts, deal opportunities." },
  { num: "03", title: "Take action", desc: "Manage, invest, or acquire with confidence. One platform, every workflow." },
];

const ROLES = [
  { icon: Building2, name: "Property Manager", features: ["Portfolio dashboard", "Tenant management", "Maintenance tracking", "Rent collection"] },
  { icon: TrendingUp, name: "Investor", features: ["Deal analysis", "ROI tracking", "Cap rate comps", "Exit modeling"] },
  { icon: BarChart3, name: "Market Analyst", features: ["Market research", "Comp analysis", "Submarket data", "Trend forecasting"] },
  { icon: Landmark, name: "Developer", features: ["Zoning analysis", "Project tracking", "Cost estimation", "Timeline management"] },
  { icon: Shield, name: "Lender", features: ["Risk assessment", "Debt stack analysis", "Loan monitoring", "Portfolio stress tests"] },
  { icon: MapPin, name: "Land Acquisition", features: ["Parcel search", "Off-market leads", "Target mapping", "Deal screening"] },
];

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const statsView = useInView(0.3);
  const featuresView = useInView(0.1);
  const stepsView = useInView(0.1);
  const rolesView = useInView(0.1);
  const ctaView = useInView(0.2);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  function handleSearch() {
    if (!searchQuery.trim()) return;
    localStorage.setItem("casa-role", "manager");
    localStorage.setItem("casa-search-query", searchQuery.trim());
    router.push("/workspace");
  }

  /* ── 1. NAVBAR ──────────────────────────────────────────────── */

  const navbar = (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? BD : "transparent"}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span style={{ fontFamily: PF, color: TX, fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>CASA</span>
        <div className="flex items-center gap-6">
          <a href="/select-role" className="text-sm transition-colors hover:opacity-70" style={{ fontFamily: IN, color: TX2 }}>Sign in</a>
          <a
            href="/select-role"
            className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:brightness-95"
            style={{ fontFamily: IN, backgroundColor: Y, color: TX, boxShadow: GLOW_SM }}
          >
            Get started
          </a>
        </div>
      </div>
    </nav>
  );

  /* ── 2. HERO ────────────────────────────────────────────────── */

  const hero = (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16" style={{ backgroundColor: "#fff" }}>
      <div className="relative text-center max-w-3xl mx-auto">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.3em] mb-6 transition-all duration-800 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ fontFamily: IN, color: TX2 }}
        >
          The Bloomberg Terminal for Real Estate
        </p>
        <h1
          className={`text-5xl sm:text-6xl md:text-[80px] leading-[1.08] mb-6 transition-all duration-800 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ fontFamily: PF, color: TX, fontWeight: 700, letterSpacing: -1 }}
        >
          Search any US property.{" "}
          <span style={{ color: YD }}>Get the full picture</span>{" "}
          in seconds.
        </h1>
        <p
          className={`text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-12 transition-all duration-800 delay-[400ms] ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ fontFamily: IN, color: TX2 }}
        >
          AI agents, live property intelligence, and portfolio management — one platform for every real estate workflow.
        </p>

        {/* Search Bar */}
        <div className={`relative max-w-xl mx-auto transition-all duration-800 delay-[600ms] ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center rounded-2xl border overflow-hidden transition-shadow focus-within:shadow-lg" style={{ borderColor: BD, backgroundColor: "#fff", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}>
            <Search className="w-5 h-5 ml-5 shrink-0" style={{ color: "#ccc" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search any US address to begin..."
              className="flex-1 bg-transparent border-0 px-4 py-5 text-base focus:outline-none"
              style={{ fontFamily: IN, color: TX, caretColor: YD }}
            />
            <button
              onClick={handleSearch}
              className="shrink-0 mr-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-95"
              style={{ backgroundColor: Y, color: TX, fontFamily: IN, boxShadow: GLOW_SM }}
            >
              Query
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-5 h-5" style={{ color: "#ddd" }} />
      </div>
    </section>
  );

  /* ── 3. STATS BAR ───────────────────────────────────────────── */

  const statsBar = (
    <section ref={statsView.ref} className="py-20" style={{ backgroundColor: "#fff", borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
        {[
          { target: 50, suffix: "+", label: "AI Agents" },
          { target: 100, suffix: "%", label: "US Coverage" },
          { target: 150, suffix: "M+", label: "Property Records" },
          { target: 6, suffix: "", label: "Role Workspaces" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-5xl md:text-6xl mb-2" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>
              <Counter target={s.target} suffix={s.suffix} visible={statsView.visible} />
            </p>
            <div className="w-8 h-[2px] mx-auto mb-2 rounded-full" style={{ backgroundColor: Y }} />
            <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: IN, color: TX2 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );

  /* ── 4. FEATURES ────────────────────────────────────────────── */

  const featuresGrid = (
    <section ref={featuresView.ref} className="py-28 px-6" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-3" style={{ fontFamily: IN, color: TX2 }}>Platform</p>
        <h2 className="text-4xl md:text-5xl text-center mb-20" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>Built for every angle</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group p-8 rounded-2xl border transition-all duration-700 cursor-default hover:-translate-y-1`}
                style={{
                  borderColor: BD,
                  backgroundColor: "#fff",
                  transitionDelay: `${i * 150}ms`,
                  opacity: featuresView.visible ? 1 : 0,
                  transform: featuresView.visible ? "translateY(0)" : "translateY(24px)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = GLOW; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                  style={{ backgroundColor: `${Y}30` }}
                >
                  <Icon className="w-7 h-7" style={{ color: YD }} />
                </div>
                <h3 className="text-xl mb-3" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: IN, color: TX2 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  /* ── 5. HOW IT WORKS ────────────────────────────────────────── */

  const howItWorks = (
    <section ref={stepsView.ref} className="py-28 px-6" style={{ backgroundColor: "#FAFAFA" }}>
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-3" style={{ fontFamily: IN, color: TX2 }}>How It Works</p>
        <h2 className="text-4xl md:text-5xl text-center mb-20" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>Three steps to clarity</h2>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px" style={{ backgroundColor: BD, opacity: stepsView.visible ? 1 : 0, transition: "opacity 1s" }} />
          <div className="space-y-16">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="relative flex items-start gap-8 transition-all duration-800"
                style={{
                  transitionDelay: `${i * 200}ms`,
                  opacity: stepsView.visible ? 1 : 0,
                  transform: stepsView.visible ? "translateX(0)" : "translateX(-20px)",
                }}
              >
                <div
                  className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold relative z-10"
                  style={{ fontFamily: PF, backgroundColor: Y, color: TX, boxShadow: GLOW_SM }}
                >
                  {step.num}
                </div>
                <div className="pt-3">
                  <h3 className="text-2xl mb-2" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>{step.title}</h3>
                  <p className="text-base leading-relaxed" style={{ fontFamily: IN, color: TX2 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  /* ── 6. ROLES ───────────────────────────────────────────────── */

  const rolesSection = (
    <section ref={rolesView.ref} className="py-28 px-6" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-3" style={{ fontFamily: IN, color: TX2 }}>Workspaces</p>
        <h2 className="text-4xl md:text-5xl text-center mb-20" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>One platform, every role</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <div
                key={role.name}
                className="group relative p-7 rounded-2xl border transition-all duration-700 overflow-hidden cursor-default hover:-translate-y-1"
                style={{
                  borderColor: BD,
                  backgroundColor: "#fff",
                  transitionDelay: `${i * 80}ms`,
                  opacity: rolesView.visible ? 1 : 0,
                  transform: rolesView.visible ? "translateY(0)" : "translateY(20px)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = GLOW; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                {/* Default */}
                <div className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110"
                    style={{ backgroundColor: `${Y}25` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: YD }} />
                  </div>
                  <h3 className="text-lg" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>{role.name}</h3>
                </div>
                {/* Hover */}
                <div className="absolute inset-0 p-7 flex flex-col justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-lg mb-4" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>{role.name}</h3>
                  <ul className="space-y-2.5">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ fontFamily: IN, color: TX2 }}>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: YD }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  /* ── 7. CTA ─────────────────────────────────────────────────── */

  const ctaSection = (
    <section ref={ctaView.ref} className="py-28 px-6" style={{ backgroundColor: YBG }}>
      <div className={`max-w-2xl mx-auto text-center transition-all duration-800 ${ctaView.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: PF, color: TX, fontWeight: 700 }}>
          The future of real estate intelligence.
        </h2>
        <p className="text-lg mb-10" style={{ fontFamily: IN, color: TX2 }}>Join the waitlist.</p>

        {submitted ? (
          <p className="text-lg font-semibold" style={{ fontFamily: IN, color: YD }}>You&apos;re on the list. We&apos;ll be in touch.</p>
        ) : (
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && setSubmitted(true)}
              placeholder="you@company.com"
              type="email"
              className="flex-1 border rounded-full px-6 py-4 text-sm focus:outline-none transition-shadow focus:shadow-md"
              style={{ fontFamily: IN, color: TX, borderColor: BD, backgroundColor: "#fff" }}
            />
            <button
              onClick={() => email && setSubmitted(true)}
              className="shrink-0 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:brightness-95"
              style={{ backgroundColor: Y, color: TX, fontFamily: IN, boxShadow: GLOW_SM }}
            >
              Join
            </button>
          </div>
        )}
      </div>
    </section>
  );

  /* ── 8. FOOTER ──────────────────────────────────────────────── */

  const footer = (
    <footer className="py-12 px-6" style={{ backgroundColor: "#fff", borderTop: `1px solid ${BD}` }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span style={{ fontFamily: PF, color: TX, fontSize: 18, fontWeight: 700 }}>CASA</span>
        <div className="flex items-center gap-8 text-sm" style={{ fontFamily: IN, color: TX2 }}>
          <span className="cursor-pointer hover:opacity-70 transition-opacity">Product</span>
          <span className="cursor-pointer hover:opacity-70 transition-opacity">Company</span>
          <span className="cursor-pointer hover:opacity-70 transition-opacity">Legal</span>
        </div>
        <p className="text-xs" style={{ fontFamily: IN, color: "#bbb" }}>&copy; {new Date().getFullYear()} CASA. All rights reserved.</p>
      </div>
    </footer>
  );

  /* ── RENDER ─────────────────────────────────────────────────── */

  return (
    <main style={{ backgroundColor: "#fff" }}>
      {navbar}
      {hero}
      {statsBar}
      {featuresGrid}
      {howItWorks}
      {rolesSection}
      {ctaSection}
      {footer}
    </main>
  );
}
