"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import MiniOrb from "@/components/MiniOrb";

const GS = "var(--font-general-sans)";
const TX = "#1A1A1A";

const PHRASES = [
  "Currently under construction",
  "Polishing the engine",
  "Tuning fifty AI agents",
  "Teaching personas to think",
  "Brewing something special",
  "Almost ready for you",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 18px",
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(26,26,26,0.10)",
  borderRadius: 12,
  fontFamily: GS,
  fontSize: 15,
  fontWeight: 400,
  color: TX,
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, role: role || undefined, use_case: useCase || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setPosition(data.position || 1);
        setSubmitted(true);
      }
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 45%, #FFFCF0 75%, #FDEFC0 100%)",
      padding: "56px 24px 56px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
    }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>

        {/* Wordmark */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: GS, fontSize: 22, fontWeight: 600, letterSpacing: "0.32em", color: TX }}>CASA</div>
          <div style={{ fontFamily: GS, fontSize: 10, fontWeight: 400, letterSpacing: "0.24em", color: TX, textTransform: "uppercase" as const, marginTop: 8 }}>Real Estate Intelligence</div>
        </div>

        {/* Mini Orb */}
        <MiniOrb />

        {!submitted ? (
          <>
            {/* Eyebrow */}
            <div style={{ fontFamily: GS, fontSize: 11, fontWeight: 500, letterSpacing: "0.32em", color: TX, textTransform: "uppercase" as const, marginBottom: 20 }}>Beta Access</div>

            {/* Headline */}
            <h1 style={{ fontFamily: GS, fontSize: 44, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, color: TX, margin: 0 }}>
              Join the waitlist
            </h1>

            {/* Rotating phrase */}
            <div style={{ height: 24, margin: "22px 0 44px" }}>
              <span style={{
                fontFamily: GS, fontSize: 15, fontWeight: 400, color: TX,
                opacity: visible ? 1 : 0, transition: "opacity 400ms ease",
              }}>
                {PHRASES[phraseIdx]}
              </span>
            </div>

            {/* Glassmorphic form card */}
            <div style={{
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.85)",
              borderRadius: 20,
              padding: "32px 28px",
              boxShadow: "0 12px 40px rgba(180,150,40,0.10), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}>
              <form onSubmit={handleSubmit}>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  style={{ ...inputStyle, marginBottom: 12 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#F9D96A"; e.currentTarget.style.background = "rgba(255,255,255,0.98)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(26,26,26,0.10)"; e.currentTarget.style.background = "rgba(255,255,255,0.75)"; }}
                />

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "15px 18px",
                  background: "#1A1A1A", color: "#FFFFFF",
                  border: "none", borderRadius: 999,
                  fontFamily: GS, fontSize: 14, fontWeight: 500, letterSpacing: "0.01em",
                  cursor: "pointer", transition: "all 0.2s ease",
                  opacity: loading ? 0.7 : 1,
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#000"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#1A1A1A"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
                >
                  {loading ? "Joining..." : "Reserve my spot \u2192"}
                </button>
              </form>

              {!showMore ? (
                <button onClick={() => setShowMore(true)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: GS, fontSize: 12, fontWeight: 500, color: TX,
                  letterSpacing: "0.02em", marginTop: 16, padding: 0,
                  transition: "opacity 0.2s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  + Tell us more about you
                </button>
              ) : (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, color: role ? TX : "#999" }}>
                    <option value="">I am a...</option>
                    <option>Investor</option><option>Property Manager</option><option>Broker</option>
                    <option>Developer</option><option>Lender</option><option>Land</option>
                    <option>Homeowner</option><option>Other</option>
                  </select>
                  <textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder="What would you use CASA for?" rows={3} style={{ ...inputStyle, resize: "vertical" as const }} />
                </div>
              )}
            </div>

            {/* Sub-copy */}
            <p style={{ fontFamily: GS, fontSize: 13, fontWeight: 400, color: TX, marginTop: 20 }}>
              No spam. Just one email when access opens.
            </p>
          </>
        ) : (
          /* Success state */
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <CheckCircle2 style={{ width: 56, height: 56, color: "#F9D96A", margin: "0 auto 20px" }} />
            <div style={{ fontFamily: GS, fontSize: 22, fontWeight: 500, color: TX, marginBottom: 12 }}>
              You&apos;re on the list.
            </div>
            <div style={{ fontFamily: GS, fontSize: 15, fontWeight: 400, color: TX }}>
              You&apos;re #{position} on the waitlist. We&apos;ll email you when access opens.
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        fontFamily: GS, fontSize: 10, fontWeight: 500, color: TX,
        letterSpacing: "0.18em", textTransform: "uppercase" as const,
        textAlign: "center", marginTop: 48,
      }}>
        &copy; 2026 CASA &middot; Built with intention
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
