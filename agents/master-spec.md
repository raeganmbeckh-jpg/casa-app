# CASA Master Spec

**Version:** 1.0
**Owner:** Raegan Beck
**Last Updated:** May 2026

---

## 1. North Star

CASA is the **Bloomberg Terminal for Real Estate** — a swarm-intelligence platform serving every major participant in the real estate ecosystem. Not a property management tool. Not an investor tool. The connective intelligence layer for all of it.

**Tagline:** *Every role. Every decision. One terminal.*

---

## 2. Architectural Principles

1. **Six workspaces, one brain.** Each workspace serves a distinct persona but shares the same agent swarm and data layer.
2. **Depth over breadth.** Each workspace ships with 8+ functional pages — full Bloomberg feel, not starter UI.
3. **Agents debate, not just answer.** Every analytical output comes from multiple agents reaching consensus or flagging disagreement.
4. **Human-in-the-loop on decisions.** CASA analyzes, scores, recommends. The licensed human approves.
5. **Outcome learning loop.** Every prediction is logged and compared to actual outcomes. Agents are tuned based on hit rate.
6. **Security agent veto.** No destructive action ships without security approval + human sign-off.

---

## 3. The Six Workspaces

### 3.1 Management
**For:** Property managers, mom-and-pop owners, institutional portfolio managers
**Core question:** *Is my portfolio healthy and what needs my attention right now?*

**Pages (8):**
1. Portfolio Overview — all properties, occupancy, NOI, alerts
2. Property Detail — single-property deep dive with agent commentary
3. Tenant Management — rent roll, lease tracking, communication log
4. Maintenance & Operations — active tickets, vendor scoring, predictive HVAC
5. Financials — P&L, cash flow, accounting integration
6. Compliance Center — lease compliance, fair housing, local ordinance tracking
7. Market Position — how each property compares to local comps
8. Owner Reports — auto-generated owner statements + monthly briefings

**Agent roles:** Operations, Tenant Relations, Maintenance Predictor, Compliance Watchdog, Financial Analyst, Vendor Scorer

---

### 3.2 Investment
**For:** Individual investors, family offices, REITs, private equity
**Core question:** *Should I buy, hold, or sell — and what's the return profile?*

**Pages (8):**
1. Deal Pipeline — under-evaluation, under-contract, closed
2. Underwriting Engine — IRR, cap rate, NOI, sensitivity analysis
3. QIS (Quantum Intelligence Score) Dashboard
4. Buyer Demand Simulator — extended from current BDS
5. Comp Engine — comparable sales, rent comps, transaction velocity
6. Portfolio Analytics — IRR-weighted exposure, geographic concentration, asset class mix
7. Capital Stack Modeler — debt/equity scenarios
8. Exit Strategy Planner — hold periods, refi options, sale timing

**Agent roles:** Underwriter, Comp Analyst, Risk Modeler, Buyer Pool (1,000 personas), Capital Stack Architect, Exit Strategist

---

### 3.3 Development
**For:** Project developers, GCs, design-build firms
**Core question:** *Can I build this profitably, on time, and how do I de-risk it?*

**Pages (8):**
1. Project Pipeline
2. Pro Forma Modeler — hard costs, soft costs, contingency, ROI
3. Construction Schedule — Gantt with critical path, weather/permit risk overlay
4. Permit & Entitlement Tracker
5. Vendor & Contractor Management
6. Cost Variance Analytics — budgeted vs actual with predictive overruns
7. Material Pricing Intelligence — commodity tracking, supplier alternatives
8. Stakeholder Communications — investor reports, lender draws, owner updates

**Agent roles:** Pro Forma Modeler, Schedule Risk Analyst, Permit Tracker, Cost Predictor, Material Sourcing Agent

---

### 3.4 Land Acquisition
**For:** Land buyers, developers scouting parcels, agricultural & timber buyers
**Core question:** *Is this parcel worth acquiring, what can I do with it, and what's it worth?*

**Pages (8):**
1. Parcel Search & Map View
2. Zoning & Entitlement Analyzer — what's allowed, what's possible with rezoning
3. Highest & Best Use Calculator
4. Environmental & Geotechnical Risk
5. Utility & Infrastructure Access
6. Comparable Land Sales
7. Acquisition Modeler — purchase price, holding costs, exit scenarios
8. Owner Outreach — off-market parcel owner ID + outreach templates

**Agent roles:** Zoning Analyst, HBU Modeler, Environmental Risk Agent, Off-Market Scout, Land Appraiser

---

### 3.5 Brokerage
**For:** Residential agents, commercial brokers, investment sales brokers
**Core question:** *How do I price this listing, who's the buyer, and how fast will it move?*

**Pages (8):**
1. Listing Pipeline
2. CMA Generator — instant comparative market analysis
3. Buyer Matching — pair listings with active buyer profiles
4. Pricing Strategy — list price recommendation with velocity prediction
5. Days-on-Market Forecaster
6. Marketing Performance — listing impressions, showings, conversion
7. Commission & Pipeline Tracker
8. Local Market Pulse — neighborhood-level absorption, price trends

**Agent roles:** CMA Builder, Buyer Matcher, Pricing Strategist, Velocity Forecaster, Market Pulse Agent

---

### 3.6 Lending
**For:** Mortgage brokers, portfolio lenders, debt funds, bank lending teams
**Core question:** *Is this loan a good risk and what terms should we offer?*

**Pages (8):**
1. Loan Pipeline
2. Underwriting Dashboard — DSCR, LTV, debt yield, stress testing
3. Borrower Profile Analysis
4. Property Risk Assessment — collateral evaluation
5. Rate & Term Modeler
6. Covenant Monitoring — ongoing compliance for active loans
7. Default Risk Predictor
8. Capital Markets Pulse — rate environment, secondary market activity

**Agent roles:** Credit Analyst, Collateral Evaluator, Stress Tester, Covenant Monitor, Rate Environment Agent

---

## 4. Cross-Cutting Layers

### 4.1 Compliance & Reporting (lives inside every workspace)
- Audit trail on every agent action
- Fair housing, ECOA, FCRA, state-specific rules
- ESG metrics for institutional users
- Auto-generated regulatory reports

### 4.2 The Brain (shared across workspaces)
- 1,000-persona Synthetic Buyer Pool
- Outcome learning database
- Comp & transaction database (ATTOM + Rentcast + proprietary)
- Quantum Intelligence Score engine

---

## 5. Manager Agent Operating Rules

**Identity:** You are CASA's Manager Agent. You build CASA autonomously while Raegan is unavailable.

**Cadence:** Hourly 10pm–7am, every 2 hours 7am–10pm. 17 runs/day.

**Each run:**
1. Read this spec.
2. Read the build log (`/agents/build-log.md`) to see what's been done.
3. Pick the highest-priority unfinished work item that fits in one run (~30-60 min of code).
4. Generate the code.
5. Submit to Security Agent for review.
6. On approval, commit to a feature branch with descriptive message.
7. Update the build log.
8. Open a PR to main (Raegan reviews and merges).

**Workspace prioritization:**
- Rotate. Don't go deep on one workspace and ignore others.
- After completing a page in workspace A, next run picks from workspace B.
- Foundation work (shared components, data layer) gets priority when blocking.

**Hard rules:**
- Never delete files without security agent approval.
- Never modify the landing page (hero, particle orb, waitlist) without explicit Raegan instruction.
- Never touch Supabase migrations without security agent approval.
- Never commit secrets, API keys, or credentials.
- Always preserve existing functionality — additive changes only unless instructed.
- Never auto-merge to main. Always open a PR.

---

## 6. Security Agent Operating Rules

**Identity:** You are CASA's Security Agent. The last line of defense before code ships.

**Triggered before every commit.**

**Block commits that:**
- Delete or rename files outside the agent's stated scope
- Modify protected paths (`/landing/*`, `/supabase/migrations/*`, `.env*`, `vercel.json`)
- Contain hardcoded secrets, API keys, tokens
- Drop database tables or columns
- Disable existing tests
- Remove the security agent itself or modify these rules
- Don't match the stated work item from the build log

**On block:**
- Halt the commit
- Log to `agent_runs` table with reason
- Notify Raegan via email
- Wait for manual override

**Escalation:** If the same block reason fires 3 times in 24 hours, pause the manager agent entirely until Raegan resumes it.

---

## 7. Build Order

Manager agent decides, but with these constraints:

**Foundation first (week 1):**
- Shared layout + navigation across all 6 workspaces
- Auth + role-based routing
- Shared Supabase schema for cross-workspace data
- Agent orchestration framework
- Build log system

**Then rotate** through workspaces, building one page per run, never more than 2 consecutive pages in the same workspace.

---

## 8. Success Metrics

- Pages shipped per week (target: 12+)
- Security agent block rate (healthy: 5-15%)
- Build log clarity (Raegan understands every commit in <30 seconds)
- Zero rogue deletions
- Zero exposed secrets

---

## 9. Out of Scope (For Now)

- Chatbot / voice agent (Phase 2)
- Public marketing site changes (Raegan owns)
- Pricing & billing logic (Phase 3)
- Mobile apps (Phase 3)
