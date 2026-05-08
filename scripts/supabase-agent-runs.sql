-- Agent runs log table
-- Tracks every manager agent run: what it tried to build, security review outcome, commit info

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running', 'success', 'blocked', 'failed', 'skipped')),
  workspace text,
  task_summary text,
  files_changed jsonb,
  branch_name text,
  commit_sha text,
  pr_number int,
  pr_url text,
  auto_merged boolean default false,
  security_decision text check (security_decision in ('approved', 'blocked', 'flagged_for_review')),
  security_reason text,
  tokens_used int,
  cost_usd numeric(10, 4),
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_runs_started_at on public.agent_runs (started_at desc);
create index if not exists idx_agent_runs_status on public.agent_runs (status);
create index if not exists idx_agent_runs_workspace on public.agent_runs (workspace);

-- RLS: only authenticated admins can read
alter table public.agent_runs enable row level security;

create policy "agent_runs readable by service role"
  on public.agent_runs
  for all
  using (auth.role() = 'service_role');
