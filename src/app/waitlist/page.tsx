"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

const PHRASES = [
  "Currently under construction",
  "Polishing the engine",
  "Tuning 50 AI agents",
  "Teaching personas to think",
  "Brewing something special",
  "Almost ready for you",
];

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistNumber, setWaitlistNumber] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Rotating subline
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Generate a waitlist number (deterministic from email)
    const num = Math.abs(email.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 200) + 12;
    setWaitlistNumber(num);
    setSubmitted(true);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "radial-gradient(ellipse at top, #FFFBEF 0%, #FFEFB8 40%, #F9D96A 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          pointerEvents: "none",
        }}
      />

      {/* Soft glow behind content */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.4)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 560, width: "100%", textAlign: "center" }}>
        {/* Wordmark */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 500, color: "#1A1A1A", marginBottom: 4 }}>
            CASA
          </h2>
          <p style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, letterSpacing: 4, color: "#6B6B6B", textTransform: "uppercase" }}>
            Real Estate Intelligence
          </p>
        </div>

        {!submitted ? (
          <>
            {/* Headline */}
            <h1 style={{
              fontFamily: "var(--font-heading)",
              fontSize: 56,
              fontWeight: 500,
              fontStyle: "italic",
              color: "#1A1A1A",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
              Join the Waitlist
            </h1>

            {/* Rotating subline */}
            <p style={{
              fontFamily: "var(--font-inter)",
              fontSize: 16,
              color: "#6B6B6B",
              fontStyle: "italic",
              marginBottom: 40,
              height: 24,
              opacity: visible ? 1 : 0,
              transition: "opacity 300ms ease",
            }}>
              {PHRASES[phraseIdx]}
            </p>

            {/* Signup form */}
            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid #F0F0F0",
                  backgroundColor: "#fff",
                  fontSize: 16,
                  fontFamily: "var(--font-inter)",
                  color: "#1A1A1A",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 12,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#F9D96A"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(249,217,106,0.3)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#F0F0F0"; e.currentTarget.style.boxShadow = "none"; }}
              />

              {/* Optional fields toggle */}
              {!showMore && (
                <button
                  type="button"
                  onClick={() => setShowMore(true)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-inter)", fontSize: 13, color: "#6B6B6B",
                    marginBottom: 12, padding: 0, textDecoration: "underline",
                    textDecorationColor: "#ddd",
                  }}
                >
                  Tell us more (optional)
                </button>
              )}

              {showMore && (
                <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    style={{
                      width: "100%", padding: 14, borderRadius: 12,
                      border: "1px solid #F0F0F0", backgroundColor: "#fff",
                      fontSize: 14, fontFamily: "var(--font-inter)", color: "#1A1A1A",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: "100%", padding: 14, borderRadius: 12,
                      border: "1px solid #F0F0F0", backgroundColor: "#fff",
                      fontSize: 14, fontFamily: "var(--font-inter)", color: role ? "#1A1A1A" : "#999",
                      outline: "none", boxSizing: "border-box",
                    }}
                  >
                    <option value="">I am a...</option>
                    <option>Investor</option>
                    <option>Property Manager</option>
                    <option>Broker</option>
                    <option>Developer</option>
                    <option>Lender</option>
                    <option>Land</option>
                    <option>Homeowner</option>
                    <option>Other</option>
                  </select>
                  <textarea
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="What would you use CASA for?"
                    rows={3}
                    style={{
                      width: "100%", padding: 14, borderRadius: 12,
                      border: "1px solid #F0F0F0", backgroundColor: "#fff",
                      fontSize: 14, fontFamily: "var(--font-inter)", color: "#1A1A1A",
                      outline: "none", boxSizing: "border-box", resize: "vertical",
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#F9D96A",
                  color: "#1A1A1A",
                  fontSize: 16,
                  fontWeight: 500,
                  fontFamily: "var(--font-inter)",
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Reserve my spot &rarr;
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <CheckCircle2 style={{ width: 64, height: 64, color: "#F9D96A", margin: "0 auto 20px" }} />
            <h2 style={{
              fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 500,
              color: "#1A1A1A", marginBottom: 8,
            }}>
              You&apos;re on the list.
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 18, color: "#1A1A1A", marginBottom: 8 }}>
              You&apos;re #{waitlistNumber} on the waitlist. We&apos;ll email you when access opens.
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#6B6B6B" }}>
              Check your inbox &mdash; you should hear from us within a week.
            </p>
          </div>
        )}

        {/* Footer */}
        <p style={{
          fontFamily: "var(--font-geist-mono)", fontSize: 11, color: "#999",
          marginTop: 48,
        }}>
          &copy; 2026 CASA &middot; Built with intention
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
