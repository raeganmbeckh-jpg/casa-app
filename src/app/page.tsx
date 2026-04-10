"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Cpu,
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
   INTERSECTION OBSERVER HOOK
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

/* ═══════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════ */

function Counter({ target, suffix = "", visible }: { target: number; suffix?: string; visible: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const duration = 1600;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * ease));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, target]);
  return <>{count}{suffix}</>;
}

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

const GOLD = "#C9A84C";
const FEATURES = [
  {
    icon: Globe,
    title: "Property Intelligence Terminal",
    desc: "Search any US address. Get owner, value, taxes, sale history, litigation status, and AI system health analysis in seconds.",
  },
  {
    icon: Brain,
    title: "50 AI Agents Working Together",
    desc: "From predictive maintenance to eviction risk scoring to off-market deal sourcing. Agents that work while you sleep.",
  },
  {
    icon: Users,
    title: "6 Role Workspaces",
    desc: "Switch between Manager, Investor, Broker, Developer, Lender, and Land Acquisition with one click.",
  },
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
   MAIN COMPONENT
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
    setHeroVisible(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch() {
    if (!searchQuery.trim()) return;
    localStorage.setItem("casa-role", "manager");
    localStorage.setItem("casa-search-query", searchQuery.trim());
    router.push("/workspace");
  }

  /* ── Navbar ─────────────────────────────────────────────────── */

  const navbar = (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <span
          className="text-white font-bold text-xl tracking-tight cursor-pointer"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          CASA
        </span>
        <div className="flex items-center gap-6">
          <a
            href="/select-role"
            className="text-sm text-white/50 hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Sign in
          </a>
          <a
            href="/select-role"
            className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:brightness-110"
            style={{
              fontFamily: "var(--font-inter)",
              backgroundColor: GOLD,
              color: "#000",
            }}
          >
            Get started
          </a>
        </div>
      </div>
    </nav>
  );

  /* ── Hero ────────────────────────────────────────────────────── */

  const hero = (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Gradient orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)` }}
      />

      <div className="relative text-center max-w-4xl mx-auto">
        {/* Eyebrow */}
        <p
          className={`text-xs font-semibold uppercase tracking-[0.35em] mb-8 transition-all duration-700 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ color: GOLD, fontFamily: "var(--font-inter)" }}
        >
          The Bloomberg Terminal for Real Estate
        </p>

        {/* Headline */}
        <h1
          className={`text-6xl sm:text-7xl md:text-[96px] font-bold leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-200 ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ fontFamily: "var(--font-inter)", color: "#fff" }}
        >
          Manage. Invest.
          <br />
          Acquire.
        </h1>

        {/* Subtext */}
        <p
          className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-[400ms] ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter)" }}
        >
          The only platform that puts AI agents, live property intelligence,
          and portfolio management in one place.
        </p>

        {/* Search Bar */}
        <div
          className={`relative max-w-2xl mx-auto transition-all duration-700 delay-[600ms] ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div
            className="relative rounded-2xl p-[1px] overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${GOLD}40, transparent 50%, ${GOLD}20)`,
              animation: "glow 3s ease-in-out infinite",
            }}
          >
            <div className="flex items-center bg-black rounded-2xl">
              <Search className="w-5 h-5 text-white/30 ml-5 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search any US address to begin..."
                className="flex-1 bg-transparent border-0 px-4 py-5 text-white text-base placeholder:text-white/25 focus:outline-none"
                style={{ fontFamily: "var(--font-inter)" }}
              />
              <button
                onClick={handleSearch}
                className="shrink-0 mr-2 px-6 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:brightness-110"
                style={{
                  backgroundColor: GOLD,
                  fontFamily: "var(--font-inter)",
                }}
              >
                Query
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/20" />
      </div>
    </section>
  );

  /* ── Stats Bar ──────────────────────────────────────────────── */

  const statsBar = (
    <section
      ref={statsView.ref}
      className="border-y border-white/5 py-16 bg-black"
    >
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { target: 50, suffix: "+", label: "AI Agents" },
          { target: 100, suffix: "%", label: "US Coverage" },
          { target: 150, suffix: "M+", label: "Property Records" },
          { target: 6, suffix: "", label: "Role Workspaces" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ color: GOLD, fontFamily: "var(--font-inter)" }}
            >
              <Counter
                target={s.target}
                suffix={s.suffix}
                visible={statsView.visible}
              />
            </p>
            <p
              className="text-sm uppercase tracking-widest"
              style={{
                color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );

  /* ── Features Grid ──────────────────────────────────────────── */

  const featuresGrid = (
    <section ref={featuresView.ref} className="py-32 bg-black px-6">
      <div className="max-w-6xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] text-center mb-4"
          style={{ color: GOLD, fontFamily: "var(--font-inter)" }}
        >
          Platform
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-20"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Built for every angle
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-1 transition-all duration-500 ${
                  featuresView.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${GOLD}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: GOLD }} />
                </div>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  /* ── How It Works ───────────────────────────────────────────── */

  const howItWorks = (
    <section ref={stepsView.ref} className="py-32 bg-black px-6">
      <div className="max-w-4xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] text-center mb-4"
          style={{ color: GOLD, fontFamily: "var(--font-inter)" }}
        >
          How It Works
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-20"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Three steps to clarity
        </h2>

        <div className="relative">
          {/* Connecting line */}
          <div
            className={`absolute left-8 top-0 bottom-0 w-px transition-all duration-1000 ${
              stepsView.visible ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background: `linear-gradient(to bottom, transparent, ${GOLD}40, ${GOLD}40, transparent)`,
            }}
          />

          <div className="space-y-16">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className={`relative flex items-start gap-8 transition-all duration-700 ${
                  stepsView.visible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div
                  className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 relative z-10"
                  style={{
                    borderColor: `${GOLD}50`,
                    color: GOLD,
                    backgroundColor: "#000",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {step.num}
                </div>
                <div className="pt-3">
                  <h3
                    className="text-2xl font-bold text-white mb-2"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-base leading-relaxed"
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  /* ── Roles ──────────────────────────────────────────────────── */

  const rolesSection = (
    <section ref={rolesView.ref} className="py-32 bg-black px-6">
      <div className="max-w-6xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] text-center mb-4"
          style={{ color: GOLD, fontFamily: "var(--font-inter)" }}
        >
          Workspaces
        </p>
        <h2
          className="text-4xl md:text-5xl font-bold text-center text-white mb-20"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          One platform, every role
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <div
                key={role.name}
                className={`group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all duration-500 overflow-hidden ${
                  rolesView.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Default view */}
                <div className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-4">
                  <Icon
                    className="w-8 h-8 mb-4"
                    style={{ color: GOLD }}
                  />
                  <h3
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {role.name}
                  </h3>
                </div>

                {/* Hover reveal */}
                <div className="absolute inset-0 p-6 flex flex-col justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <h3
                    className="text-lg font-bold mb-3"
                    style={{ color: GOLD, fontFamily: "var(--font-inter)" }}
                  >
                    {role.name}
                  </h3>
                  <ul className="space-y-2">
                    {role.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm"
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        <ArrowRight
                          className="w-3 h-3 shrink-0"
                          style={{ color: GOLD }}
                        />
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

  /* ── CTA ────────────────────────────────────────────────────── */

  const ctaSection = (
    <section ref={ctaView.ref} className="py-32 bg-black px-6">
      <div
        className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
          ctaView.visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <h2
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          The future of real estate intelligence.
        </h2>
        <p
          className="text-lg mb-10"
          style={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Join the waitlist.
        </p>

        {submitted ? (
          <p
            className="text-lg font-semibold"
            style={{ color: GOLD, fontFamily: "var(--font-inter)" }}
          >
            You&apos;re on the list. We&apos;ll be in touch.
          </p>
        ) : (
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && setSubmitted(true)}
              placeholder="you@company.com"
              type="email"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-white/20"
              style={{ fontFamily: "var(--font-inter)" }}
            />
            <button
              onClick={() => email && setSubmitted(true)}
              className="shrink-0 px-8 py-4 rounded-full text-sm font-semibold text-black transition-all hover:brightness-110"
              style={{
                backgroundColor: GOLD,
                fontFamily: "var(--font-inter)",
              }}
            >
              Join
            </button>
          </div>
        )}
      </div>
    </section>
  );

  /* ── Footer ─────────────────────────────────────────────────── */

  const footer = (
    <footer className="border-t border-white/5 py-12 bg-black px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span
          className="text-white font-bold text-lg tracking-tight"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          CASA
        </span>
        <div
          className="flex items-center gap-8 text-sm"
          style={{
            color: "rgba(255,255,255,0.35)",
            fontFamily: "var(--font-inter)",
          }}
        >
          <span className="hover:text-white/60 cursor-pointer transition-colors">
            Product
          </span>
          <span className="hover:text-white/60 cursor-pointer transition-colors">
            Company
          </span>
          <span className="hover:text-white/60 cursor-pointer transition-colors">
            Legal
          </span>
        </div>
        <p
          className="text-xs"
          style={{
            color: "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-inter)",
          }}
        >
          &copy; {new Date().getFullYear()} CASA. All rights reserved.
        </p>
      </div>
    </footer>
  );

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <main className="bg-black min-h-screen">
      <style jsx global>{`
        @keyframes glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
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
