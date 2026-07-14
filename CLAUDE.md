# CASA — Project Rules

## Deploy

- Deploys only via `npm run ship` (build + vercel --prod + verify).
- Git push alone does NOT count as deployed — the GitHub webhook is broken.
- Every task ends with `npm run ship` passing. A commit alone is NOT done.

## Architecture

- Six roles exactly: manager, investor, developer, land, broker, lender.
- `'use client'` files export components ONLY. Constants, tokens, and helpers live in `src/components/ui/tokens.ts` or `src/lib/`.
- Design tokens come from `src/components/ui/tokens.ts`, never hardcoded hex values in pages.
- Pages query real Supabase tables. No mock arrays. No hardcoded data.
- Server components import tokens from `@/components/ui/tokens`. Client components may import from `@/components/ui/primitives` (which re-exports tokens).

## Design System

- North star: `/prototype` aesthetic.
- Cream `#FAFAF7`, ink `#111111`, cards `#fffdf8`, stone-200 borders, oversized radii (`rounded-[2.5rem]`), black pill buttons.
- Yellow `#F9D96A` only as soft washes/dots — never as primary backgrounds.
- One dark statement card per view with a live computed number.
- Font families: `var(--font-heading)` for titles, `var(--font-geist-mono)` for labels/numbers, `var(--font-inter)` for body.

## Data Law

- `verify:data` must pass before any task is done. A source silently returning nothing is a FAIL, not a shrug.
- The unified property API must return data from ATTOM, Rentcast, and Google for any valid address.
- Critical fields (year_built, beds, sqft_living, market_value_avm, rent_estimate) must have non-null values with confidence > 0.
- Supabase tables backing each workspace must have rows — an empty table means a workspace lost its data source.

## Work Style

- Work in SMALL batches — one page or one feature per task, never a multi-workspace sweep in one shot.
- Commit with honest messages describing what actually changed.
- If a build fails, fix and rebuild before deploying. Never deploy a broken build.
