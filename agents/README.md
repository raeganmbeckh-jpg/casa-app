# CASA Agents

Autonomous build system for CASA. Manager agent runs on a schedule and ships code while Raegan is away.

## Architecture

```
Vercel cron (17 runs/day)
    └─► /api/agent/run
        └─► manager.ts
            ├─► reads master-spec.md + build-log.md
            ├─► asks Claude to plan & generate code
            ├─► security.ts reviews changeset
            │     ├─► hard rules (protected paths, secrets, destructive SQL)
            │     └─► LLM review (does code match task?)
            ├─► creates branch + commits files via GitHub API
            ├─► opens PR
            ├─► auto-merges if eligible (small + low-risk + approved)
            ├─► updates build-log.md
            └─► logs run to Supabase agent_runs table
```

## Files

- `master-spec.md` — the blueprint. The agent reads this every run. **Edit this to change CASA's direction.**
- `manager.ts` — orchestrator. Plans tasks, generates code, opens PRs.
- `security.ts` — guardrails. Blocks anything sketchy.
- `notify.ts` — email alerts via Resend.
- `build-log.md` — append-only history of what got built. Updated by the manager.

## Schedule

Set in `vercel.json`:
- 10pm–7am: hourly (9 runs)
- 7am–10pm: every 2 hours (8 runs)
- **Total: 17 runs/day**

## Environment variables (set in Vercel)

- `ANTHROPIC_API_KEY` — for code generation + security review
- `GITHUB_TOKEN` — fine-grained PAT with read/write on Contents, Issues, PRs, Workflows
- `NEXT_PUBLIC_SUPABASE_URL` — already set
- `SUPABASE_SERVICE_ROLE_KEY` — already set
- `RESEND_API_KEY` — for alert emails
- `CRON_SECRET` — Vercel auto-injects this for cron triggers

## Auto-merge rules

The agent auto-merges PRs that meet ALL of:
- Security review = approved (not flagged, not blocked)
- Risk level = low
- ≤ 3 files
- ≤ 500 lines total
- Not creating a new `page.tsx`
- No API route changes
- No middleware changes
- No package.json changes

Anything else opens as a PR for Raegan to review.

## Hard rules (security agent blocks immediately)

- Modifications to landing page (`src/app/page.tsx`, `src/app/(landing)/`, `src/components/landing/`, `public/orb`)
- Supabase migrations
- `.env*` files
- `vercel.json`
- The security agent itself or master spec
- GitHub Actions workflows
- `package-lock.json` hand edits
- Any file containing what looks like a secret
- Destructive SQL (`DROP TABLE`, etc.)

## How to pause the agent

Either:
1. Vercel dashboard → casa-app → Settings → Cron Jobs → disable
2. Remove `CRON_SECRET` env var (cron requests will 401)

## How to review what the agent did

- **GitHub**: open PRs at github.com/raeganmbeckh-jpg/casa-app/pulls
- **Build log**: `agents/build-log.md` (auto-updated each run)
- **Run history**: Supabase → `agent_runs` table
- **Email**: alerts to raeganmbeckh@gmail.com on blocks and failures

## Cost

At 17 runs/day, expect ~$15-60/day in Anthropic API costs depending on code volume per run. Set up usage alerts in console.anthropic.com → Plans & Billing.
