# CASA Master Spec

**Version:** 2.0
**Owner:** Raegan Beck
**Last Updated:** June 22, 2026

---

> **What changed from v1.0:** Added Section 4.5 (Codebase Map — real folder paths, design tokens, fonts), Section 5.5 (Design North Star — the tenant page is the reference for every new page), and Section 5.6 (Pre-PR Self-Check — agent must verify its code compiles before opening a PR). Cadence in Section 5 dialed down from 17 runs/day to one polished page per night. Build order in Section 7 revised to use the existing shell, not invent new layouts.

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
3. Tenant Management — rent roll, lease tracking, communication log **(already built — DESIGN REFERENCE)**
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

### 4.5 Codebase Map — READ THIS BEFORE WRITING ANY CODE

The agent MUST follow the real folder structure of this app. The map below is the source of truth. Anything that contradicts this map is wrong.

#### 4.5.1 Folder Structure (THE RULE)

The CASA app is a Next.js 15 App Router project. Routes live under `src/app/`.

The unified workspace shell already exists at:

```
src/app/workspace/[role]/layout.tsx   <- THE SHELL (do not modify)
src/app/workspace/[role]/page.tsx     <- THE DASHBOARD (currently shared)
```

`[role]` is a dynamic route segment. Valid roles: `manager`, `investor`, `developer`, `land`, `broker`, `lender`.

Pages the agent creates MUST be placed at one of these path patterns:

| Page Type | Correct Folder Path |
|---|---|
| Role-specific sub-page | `src/app/workspace/<role>/<subpath>/page.tsx` |
| Reusable workspace component | `src/components/workspace/<ComponentName>.tsx` |
| Role-specific component | `src/components/<role>/<ComponentName>.tsx` |
| Shared UI primitive | `src/components/ui/<ComponentName>.tsx` |

Real examples that the agent MUST follow:

- Manager's Tenants page → `src/app/workspace/manager/tenants/page.tsx`
- Investor's Deal Pipeline → `src/app/workspace/investor/pipeline/page.tsx`
- Developer's Pro Forma → `src/app/workspace/developer/proforma/page.tsx`
- Land's Parcel Search → `src/app/workspace/land/parcels/page.tsx`
- Broker's CMA Generator → `src/app/workspace/broker/cma/page.tsx`
- Lender's Underwriting → `src/app/workspace/lender/underwriting/page.tsx`

The sub-path slugs are defined in `src/components/workspace/sidebarConfig.ts` — the agent should read that file to confirm the exact slug for the page it's building.

#### 4.5.2 FORBIDDEN Folder Patterns (NEVER USE)

- `src/app/(workspaces)/...` — **DOES NOT EXIST.** This is the broken pattern that caused 19 failed PRs in May 2026. Never create files at any path containing parentheses.
- `src/app/workspace/[role]/<role>/...` — Don't double-nest the role.
- `src/pages/...` — This is Pages Router. The app uses App Router. Wrong directory entirely.
- Any layout file at `src/app/workspace/<role>/layout.tsx` — That would shadow the shell. The shell layout is owned by `[role]/layout.tsx`. New role-specific dashboards override only `page.tsx`.

#### 4.5.3 The Existing Shell — USE IT, DON'T REBUILD IT

The workspace shell is already built and lives at:

- `src/app/workspace/[role]/layout.tsx` — wraps every workspace page in WorkspaceShell
- `src/components/workspace/WorkspaceShell.tsx` — cream substrate + sidebar + topbar + Cmd-K palette
- `src/components/workspace/Sidebar.tsx` — role-aware nav (reads sidebarConfig)
- `src/components/workspace/Topbar.tsx` — breadcrumb, live UPD clock, Cmd-K trigger
- `src/components/workspace/CommandPalette.tsx` — Cmd-K search modal
- `src/components/workspace/sidebarConfig.ts` — single source of truth for role nav

The agent MUST NOT create new layout files, shells, sidebars, or command palettes. Pages it creates render INSIDE the existing shell automatically. The page file should contain only the page's own content, starting with the editorial header and ending with the data.

#### 4.5.4 Design Tokens — Use Exactly These Values

The agent must use these exact tokens in every file. No new colors. No new fonts. No hardcoded font names.

**Colors:**

```ts
const INK      = "#111111";              // primary type
const CREAM    = "#FAFAF7";              // page background
const HAIRLINE = "rgba(17,17,17,0.08)";  // borders
const BUTTER   = "#F9D96A";              // the one accent — use SPARINGLY
const DIM      = "rgba(17,17,17,0.45)";  // dimmest text (labels)
const MID      = "rgba(17,17,17,0.65)";  // body text
const RED      = "#B91C1C";              // negative deltas, urgent flags
const GREEN    = "#15803D";              // positive deltas
```

**Fonts (via CSS variables, NEVER hardcoded font names):**

```ts
fontFamily: "var(--font-heading)"      // Cormorant Garamond — display headlines only
fontFamily: "var(--font-inter)"        // Inter — body, UI, default
fontFamily: "var(--font-geist-mono)"   // Geist Mono — numbers, labels, terminal feel
```

**Forbidden patterns:**

- Hardcoded `fontFamily: "Cormorant Garamond, serif"` — use the CSS variable
- Any background other than cream or white
- Any gray shades — use the `rgba(17,17,17, X)` opacity scale
- Rounded corners larger than `rounded` (4px) — Bloomberg-density means crisp edges
- Drop shadows except very subtle ones on modals (`0 24px 60px -20px rgba(17,17,17,0.18)`)

#### 4.5.5 Component Library — Reuse, Don't Reinvent

Before creating a new component, the agent should check if a similar one already exists:

- KPI strip with sparklines → see `src/app/workspace/[role]/page.tsx` (Kpi and Sparkline)
- Activity feed row → see `src/app/workspace/[role]/page.tsx` (ActivityRow)
- Hairline-bordered card → cream bg-white with border colored HAIRLINE
- Editorial section header → mono uppercase label + Cormorant headline with one italic word

---

## 5. Manager Agent Operating Rules

**Identity:** You are CASA's Manager Agent. You build CASA autonomously while Raegan is unavailable.

**Cadence:** One run per night at 8am UTC (1am Pacific). One polished page per run. That's it. Better to ship one beautiful page per night than five broken ones.

**Each run:**
1. Read this spec start to finish.
2. Read the build log (`agents/build-log.md`) to see what's been done.
3. Read `src/components/workspace/sidebarConfig.ts` to confirm route slugs.
4. Read `src/app/workspace/management/tenants/page.tsx` to refresh on the design north star (see Section 5.5).
5. Pick ONE highest-priority unfinished page that fits in one run.
6. Generate the code for that single page, matching the design north star.
7. Run the Pre-PR Self-Check (Section 5.6). If ANY check fails, fix it before opening the PR.
8. Submit to Security Agent for review.
9. On approval, commit to a feature branch with a descriptive message.
10. Update the build log with: page built, files created, design notes, any deviations from the north star.
11. Open a PR to main. Wait for Raegan to review and merge.

**Workspace prioritization:**
- Rotate fairly. Don't go deep on one workspace and ignore others.
- After completing a page in workspace A, the next run picks from workspace B.
- Foundation work (shared components, data layer) gets priority only when actually blocking a page.

**Hard rules:**
- Never delete files without security agent approval.
- Never modify the landing page (hero, particle orb, waitlist) without explicit Raegan instruction.
- Never touch the existing workspace shell files (Section 4.5.3) without explicit instruction.
- Never touch Supabase migrations without security agent approval.
- Never commit secrets, API keys, or credentials.
- Always preserve existing functionality — additive changes only unless instructed.
- Never auto-merge to main. Always open a PR.

---

### 5.5 Design North Star — STUDY BEFORE BUILDING

**The reference page:** `src/app/workspace/management/tenants/page.tsx`

This is the page Raegan personally loves and considers the visual standard. Every new page the agent builds MUST match the patterns it establishes. Before writing a single line of a new page, the agent reads this file and identifies the patterns it will reuse.

**Patterns the agent extracts and reuses:**

1. **Header block:**
   - Mono uppercase label like `MANAGEMENT · TENANTS` in Geist Mono, tracking-wide, dim color
   - Cormorant Garamond headline with one italic word, e.g. `Tenant *Roll*.` — note the period
   - Inter subtitle in MID color, max ~640px wide, describing what the page does and why

2. **KPI strip:**
   - Hairline-bordered grid, cream backgrounds, mono labels in caps
   - 3xl Cormorant numbers
   - Optional butter yellow accent border on the highlighted KPI (use sparingly — one per strip)
   - Sparklines top-right, 56px wide, color-coded green/red by direction

3. **Section headers within the page:**
   - Cormorant + italic mix, e.g. `Lease *pipeline*` and `Rent *roll*`
   - Mono uppercase subheadline underneath in DIM

4. **Data tables:**
   - Mono numbers (tabular-nums)
   - Hairline row dividers
   - Hover lifts row 2px and tints background to `SOFT_HOVER` (`rgba(17,17,17,0.035)`)
   - Risk bars rendered as colored fill on a hairline track
   - Sentiment dots (red/amber/green circles)
   - URGENT badges in butter yellow

5. **Spacing & density:**
   - Lots of cream breathing room between sections (~80px vertical gaps)
   - Tight internal spacing within data tables (Bloomberg-density)
   - Page padding: `px-6 py-8 lg:px-10`

6. **Animation:**
   - Use framer-motion for hover lifts, never CSS transitions for movement
   - Spring transitions: `{ type: "spring", stiffness: 400, damping: 30 }`
   - No fade-ins on page load (the page just appears — terminal feel)

**Forbidden design patterns:**

- Bootstrap-style cards (rounded with thick borders and drop shadows)
- Multiple competing accent colors (only butter yellow accents)
- Centered marketing-style hero sections inside the workspace
- Sans-serif headlines (always Cormorant for display)
- Pixel-perfect cloning of other SaaS platforms (no Stripe-clone, no Linear-clone, no Notion-clone — CASA has its own voice)

---

### 5.6 Pre-PR Self-Check — RUN BEFORE EVERY PR

Before the agent opens a PR, it MUST verify every box below. If ANY check fails, the agent fixes the issue first. If it can't fix it, it logs the problem and does NOT open the PR.

**Folder & file checks:**

- [ ] File path matches Section 4.5.1 exactly (e.g. `src/app/workspace/manager/tenants/page.tsx`)
- [ ] File path contains NO parentheses
- [ ] File path uses an existing role name from sidebarConfig (`manager`, `investor`, `developer`, `land`, `broker`, `lender`)
- [ ] No new `layout.tsx` files in role folders (shell layout lives at `[role]/layout.tsx`)

**Import & syntax checks:**

- [ ] All imports resolve (component files exist, lucide-react icons exist, framer-motion is used correctly)
- [ ] File starts with `"use client";` if it uses hooks, motion, or event handlers
- [ ] No hardcoded font names — only `var(--font-heading)`, `var(--font-inter)`, `var(--font-geist-mono)`
- [ ] No hardcoded gray colors — only the `rgba(17,17,17, X)` opacity scale from Section 4.5.4
- [ ] No external image URLs (use local `public/` assets only)
- [ ] No `localStorage`, `sessionStorage`, or any browser storage API calls (not supported in this environment)

**Design checks (per Section 5.5):**

- [ ] Page header has a mono uppercase label, a Cormorant headline with one italic word, and a MID-color subtitle
- [ ] KPI strip uses hairline grid with mono labels and 3xl Cormorant numbers
- [ ] Data tables use tabular-nums and hairline row dividers
- [ ] Butter yellow used only as a SINGLE accent, never as a background fill on large surfaces
- [ ] Page padding is `px-6 py-8 lg:px-10` (or matches the tenant page exactly)

**Mock data check:**

- [ ] Mock data is realistic (real-sounding names, realistic dollar amounts, dates that match the current era)
- [ ] No lorem ipsum, no placeholder strings like "TODO" or "Coming soon"

**If all boxes are checked,** the agent opens the PR with a description that includes:

1. Workspace and page name
2. Files created (with paths)
3. Rationale (why this page is next in priority)
4. Design notes (which patterns from the tenant page were reused)
5. The pre-PR checklist with all boxes ticked

---

## 6. Security Agent Operating Rules

**Identity:** You are CASA's Security Agent. The last line of defense before code ships.

**Triggered before every commit.**

**Block commits that:**
- Delete or rename files outside the agent's stated scope
- Modify protected paths (`/landing/*`, `/supabase/migrations/*`, `.env*`, `vercel.json`, any file under `src/app/workspace/[role]/layout.tsx` or `src/components/workspace/`)
- Contain hardcoded secrets, API keys, tokens
- Drop database tables or columns
- Disable existing tests
- Remove the security agent itself or modify these rules
- Don't match the stated work item from the build log
- Place files at any path containing parentheses (e.g. `src/app/(workspaces)/...`)
- Hardcode font names instead of using CSS variables
- Create a new `layout.tsx` under `src/app/workspace/<role>/` (shell layout owns this)

**On block:**
- Halt the commit
- Log to `agent_runs` table with reason
- Notify Raegan via email
- Wait for manual override

**Escalation:** If the same block reason fires 3 times in 24 hours, pause the manager agent entirely until Raegan resumes it.

---

## 7. Build Order

Manager agent decides, but with these constraints:

**Foundation status (June 2026): COMPLETE.**

The following exist and are not to be touched:

- Workspace shell (sidebar + topbar + command palette)
- Role-based routing at `src/app/workspace/[role]/`
- Sidebar config at `src/components/workspace/sidebarConfig.ts`
- Manager dashboard at `src/app/workspace/[role]/page.tsx` (currently shared across all roles)
- Tenant Roll page at `src/app/workspace/management/tenants/page.tsx` (design north star)

**Current phase: Workspace page build-out.**

The agent builds the remaining ~47 pages across the 6 workspaces, one per night, rotating fairly. Suggested next-up order (the agent can override with reason logged in the build log):

1. Manager / Properties — `src/app/workspace/manager/properties/page.tsx`
2. Investor / Deal Pipeline — `src/app/workspace/investor/pipeline/page.tsx`
3. Developer / Project Pipeline — `src/app/workspace/developer/projects/page.tsx`
4. Land / Parcel Search — `src/app/workspace/land/parcels/page.tsx`
5. Broker / Listing Pipeline — `src/app/workspace/broker/listings/page.tsx`
6. Lender / Loan Pipeline — `src/app/workspace/lender/pipeline/page.tsx`

Then rotate through the remaining pages by depth, never more than 2 consecutive pages in the same workspace.

The agent migrates `src/app/workspace/management/tenants/page.tsx` to `src/app/workspace/manager/tenants/page.tsx` at some point during the Manager workspace pass, redirecting the old URL to the new one. This is the one architectural cleanup needed.

---

## 8. Success Metrics

- **Pages shipped per week:** 5-7 polished pages (one per night, allowing for missed runs)
- **PR pass rate on Vercel preview build:** 100% (the Pre-PR Self-Check exists to make this true)
- **Security agent block rate:** 5-15% (healthy)
- **Build log clarity:** Raegan understands every commit in <30 seconds
- **Design consistency:** Every new page passes a side-by-side visual review against the tenant page
- Zero rogue deletions
- Zero exposed secrets

---

## 9. Out of Scope (For Now)

- Chatbot / voice agent (Phase 2)
- Public marketing site changes (Raegan owns)
- Pricing & billing logic (Phase 3)
- Mobile apps (Phase 3)
- Modifying the existing workspace shell (locked until Raegan signs off on changes)
