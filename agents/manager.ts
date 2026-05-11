// CASA Manager Agent
// Runs on a schedule. Reads spec, picks a task, generates code, commits, opens PR.
//
// Flow:
//   1. Load master spec + recent build log
//   2. Ask Claude to pick the next task and generate code for it
//   3. Run security agent review on the proposed changes
//   4. If approved: create branch, commit files, open PR (auto-merge if eligible)
//   5. If blocked: log it, email Raegan, halt
//   6. Log everything to agent_runs in Supabase

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { Octokit } from '@octokit/rest';
import { reviewChangeset, isAutoMergeEligible } from './security';
import { sendAlert } from './notify';

const REPO_OWNER = 'raeganmbeckh-jpg';
const REPO_NAME = 'casa-app';
const BASE_BRANCH = 'main';

// Lazy-initialized clients — only created at runtime, not during Next.js build
function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }
function getSupabase() { return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!); }
function getOctokit() { return new Octokit({ auth: process.env.GITHUB_TOKEN }); }

type ProposedFile = {
  path: string;
  content: string;
  action: 'create' | 'update';
};

type AgentProposal = {
  workspace: string;
  task_summary: string;
  rationale: string;
  files: ProposedFile[];
};

export async function runManagerAgent() {
  const runId = await startRun();

  try {
    const spec = await loadFile('agents/master-spec.md');
    const buildLog = await loadFile('agents/build-log.md').catch(() => '# Build Log\n\nNo runs yet.\n');
    const recentRuns = await getRecentRuns(20);

    const proposal = await generateProposal(spec, buildLog, recentRuns);

    const review = await reviewChangeset(proposal, getAnthropic());

    if (review.decision === 'blocked') {
      await finishRun(runId, {
        status: 'blocked',
        workspace: proposal.workspace,
        task_summary: proposal.task_summary,
        security_decision: 'blocked',
        security_reason: review.reason,
      });
      await sendAlert({
        subject: 'CASA Agent — security block',
        body: `The manager agent tried to do this:\n\n${proposal.task_summary}\n\nSecurity blocked it because:\n\n${review.reason}\n\nNo changes were made.`,
      });
      await checkRepeatedBlocks(review.reason);
      return { status: 'blocked', reason: review.reason };
    }

    const branchName = `agent/${proposal.workspace}-${Date.now()}`;
    const commitSha = await createBranchAndCommit(branchName, proposal);
    const pr = await openPullRequest(branchName, proposal);

    let autoMerged = false;
    if (isAutoMergeEligible(proposal, review)) {
      try {
        await getOctokit().pulls.merge({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          pull_number: pr.number,
          merge_method: 'squash',
        });
        autoMerged = true;
      } catch (mergeErr) {
        console.warn('Auto-merge failed, leaving PR for manual review:', mergeErr);
      }
    }

    await updateBuildLog(proposal, pr.html_url, autoMerged);

    await finishRun(runId, {
      status: 'success',
      workspace: proposal.workspace,
      task_summary: proposal.task_summary,
      files_changed: proposal.files.map(f => f.path),
      branch_name: branchName,
      commit_sha: commitSha,
      pr_number: pr.number,
      pr_url: pr.html_url,
      auto_merged: autoMerged,
      security_decision: review.decision,
    });

    return { status: 'success', pr_url: pr.html_url, auto_merged: autoMerged };
  } catch (err: any) {
    console.error('Manager agent run failed:', err);
    await finishRun(runId, {
      status: 'failed',
      error_message: err.message ?? String(err),
    });
    await sendAlert({
      subject: 'CASA Agent — run failed',
      body: `A manager agent run failed:\n\n${err.message ?? String(err)}`,
    });
    throw err;
  }
}

async function generateProposal(
  spec: string,
  buildLog: string,
  recentRuns: any[]
): Promise<AgentProposal> {
  const recentSummary = recentRuns
    .slice(0, 10)
    .map(r => `- [${r.status}] ${r.workspace ?? '?'}: ${r.task_summary ?? '(no summary)'}`)
    .join('\n');

  const systemPrompt = `You are the CASA Manager Agent. You build CASA — the Bloomberg Terminal for Real Estate — autonomously.

Read the master spec carefully and follow ALL operating rules. Especially:
- Rotate workspaces. Never go more than 2 consecutive runs in the same workspace.
- One run = one focused task that fits in ~30-60 minutes of code (1-5 files).
- Foundation work first if blocking.
- Never delete files or modify protected paths (landing/, supabase/migrations/, .env*, vercel.json).
- Never commit secrets.
- Always additive changes unless explicitly instructed otherwise.

You will respond with VALID JSON ONLY (no markdown fences, no commentary). Schema:
{
  "workspace": "management" | "investment" | "development" | "land" | "brokerage" | "lending" | "foundation",
  "task_summary": "one-line description",
  "rationale": "why this task is the right next step given the build log",
  "files": [
    { "path": "src/app/...", "content": "full file contents", "action": "create" | "update" }
  ]
}

Path conventions for casa-app repo:
- Pages: src/app/(workspaces)/{workspace}/{page}/page.tsx
- Components: src/components/{workspace}/{ComponentName}.tsx
- Shared: src/components/shared/...
- API routes: src/app/api/...

Use TypeScript, Next.js 14 App Router, Tailwind, design system: white background, butter yellow #F9D96A accents, Cormorant Garamond headlines, Inter body.`;

  const userPrompt = `MASTER SPEC:
${spec}

BUILD LOG:
${buildLog}

RECENT RUNS:
${recentSummary || '(no recent runs)'}

Pick the next highest-priority task and generate the code. Respond with JSON only.`;

  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find(b => b.type === 'text') as any;
  const raw = textBlock?.text ?? '';
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned) as AgentProposal;
    if (!parsed.files || !Array.isArray(parsed.files) || parsed.files.length === 0) {
      throw new Error('Proposal contained no files');
    }
    return parsed;
  } catch (e) {
    throw new Error(`Failed to parse agent proposal as JSON: ${e}\n\nRaw: ${raw.slice(0, 500)}`);
  }
}

async function loadFile(path: string): Promise<string> {
  const { data } = await getOctokit().repos.getContent({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path,
    ref: BASE_BRANCH,
  });
  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`Path ${path} is not a file`);
  }
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

async function createBranchAndCommit(branchName: string, proposal: AgentProposal): Promise<string> {
  const { data: baseRef } = await getOctokit().git.getRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `heads/${BASE_BRANCH}`,
  });

  await getOctokit().git.createRef({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    ref: `refs/heads/${branchName}`,
    sha: baseRef.object.sha,
  });

  let lastSha = baseRef.object.sha;
  for (const file of proposal.files) {
    // Always try to fetch existing SHA — needed for both creates (overwrites) and updates
    let existingSha: string | undefined;
    try {
      const existing = await getOctokit().repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: file.path,
        ref: branchName,
      });
      if (!Array.isArray(existing.data) && existing.data.type === 'file') {
        existingSha = existing.data.sha;
      }
    } catch {
      // 404 — file doesn't exist yet, no SHA needed
    }

    const result = await getOctokit().repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: file.path,
      message: `${proposal.workspace}: ${proposal.task_summary} — ${file.path}`,
      content: Buffer.from(file.content, 'utf-8').toString('base64'),
      branch: branchName,
      sha: existingSha,
    });
    lastSha = result.data.commit.sha ?? lastSha;
  }

  return lastSha;
}

async function openPullRequest(branchName: string, proposal: AgentProposal) {
  const body = `**Workspace:** ${proposal.workspace}
**Task:** ${proposal.task_summary}

**Rationale:**
${proposal.rationale}

**Files changed (${proposal.files.length}):**
${proposal.files.map(f => `- \`${f.path}\` (${f.action})`).join('\n')}

---
*Opened by CASA Manager Agent*`;

  const { data: pr } = await getOctokit().pulls.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title: `[agent] ${proposal.workspace}: ${proposal.task_summary}`,
    head: branchName,
    base: BASE_BRANCH,
    body,
  });

  return pr;
}

async function updateBuildLog(proposal: AgentProposal, prUrl: string, autoMerged: boolean) {
  const existing = await loadFile('agents/build-log.md').catch(() => '# Build Log\n\n');
  const timestamp = new Date().toISOString();
  const entry = `\n## ${timestamp}\n- **Workspace:** ${proposal.workspace}\n- **Task:** ${proposal.task_summary}\n- **Files:** ${proposal.files.map(f => f.path).join(', ')}\n- **PR:** ${prUrl}${autoMerged ? ' (auto-merged)' : ''}\n`;
  const updated = existing + entry;

  let existingSha: string | undefined;
  try {
    const { data } = await getOctokit().repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: 'agents/build-log.md',
      ref: BASE_BRANCH,
    });
    if (!Array.isArray(data) && data.type === 'file') existingSha = data.sha;
  } catch {
    // doesn't exist yet
  }

  await getOctokit().repos.createOrUpdateFileContents({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    path: 'agents/build-log.md',
    message: `chore: update build log for ${proposal.workspace}`,
    content: Buffer.from(updated, 'utf-8').toString('base64'),
    branch: BASE_BRANCH,
    sha: existingSha,
  });
}

async function startRun(): Promise<string> {
  const { data, error } = await getSupabase()
    .from('agent_runs')
    .insert({ status: 'running' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function finishRun(runId: string, fields: Record<string, any>) {
  await getSupabase()
    .from('agent_runs')
    .update({ ...fields, finished_at: new Date().toISOString() })
    .eq('id', runId);
}

async function getRecentRuns(limit: number) {
  const { data } = await getSupabase()
    .from('agent_runs')
    .select('status, workspace, task_summary, started_at')
    .order('started_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

async function checkRepeatedBlocks(reason: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await getSupabase()
    .from('agent_runs')
    .select('id')
    .eq('security_reason', reason)
    .eq('status', 'blocked')
    .gte('started_at', oneDayAgo);
  if ((data?.length ?? 0) >= 3) {
    await sendAlert({
      subject: 'CASA Agent — paused after 3 repeated security blocks',
      body: `The same security rule has fired 3 times in 24 hours:\n\n"${reason}"\n\nManual intervention recommended before resuming.`,
    });
  }
}
