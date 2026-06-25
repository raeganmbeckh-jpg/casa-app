// CASA Security Agent
// Reviews every proposed changeset before it ships.
// Returns: approved | flagged_for_review | blocked

import Anthropic from '@anthropic-ai/sdk';

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

export type SecurityReview = {
  decision: 'approved' | 'flagged_for_review' | 'blocked';
  reason: string;
  risk_level: 'low' | 'medium' | 'high';
};

// Hard rules — bypass Claude review, blocked immediately
const PROTECTED_PATHS = [
  /^src\/app\/page\.tsx$/,
  /^src\/app\/(landing|hero)\//,
  /^src\/components\/landing\//,
  /^public\/orb/,
  /^supabase\/migrations\//,
  /^\.env/,
  /^vercel\.json$/,
  /^agents\/security\.ts$/,
  /^agents\/master-spec\.md$/,
  /^\.github\/workflows\//,
  /package-lock\.json$/,
];

const SECRET_PATTERNS = [
  /sk-ant-[a-zA-Z0-9_-]{20,}/,
  /github_pat_[a-zA-Z0-9_]{20,}/,
  /re_[a-zA-Z0-9]{20,}/,
  /eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}/,
  /[a-zA-Z0-9]{32,}\.supabase\.co/,
  /AKIA[0-9A-Z]{16}/,
];

export async function reviewChangeset(
  proposal: AgentProposal,
  anthropic: Anthropic
): Promise<SecurityReview> {
  for (const file of proposal.files) {
    for (const pattern of PROTECTED_PATHS) {
      if (pattern.test(file.path)) {
        return {
          decision: 'blocked',
          reason: `File ${file.path} is in a protected path. Pattern: ${pattern}`,
          risk_level: 'high',
        };
      }
    }

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(file.content)) {
        return {
          decision: 'blocked',
          reason: `File ${file.path} appears to contain a secret matching pattern ${pattern}`,
          risk_level: 'high',
        };
      }
    }

    if ((file as any).action === 'delete') {
      return {
        decision: 'blocked',
        reason: `Deletion of ${file.path} not allowed`,
        risk_level: 'high',
      };
    }

    if (/\bdrop\s+(table|database|schema|column)\b/i.test(file.content)) {
      return {
        decision: 'blocked',
        reason: `File ${file.path} contains a destructive SQL statement`,
        risk_level: 'high',
      };
    }
  }

  const validWorkspaces = ['management', 'investment', 'development', 'land', 'brokerage', 'lending', 'foundation'];
  if (!validWorkspaces.includes(proposal.workspace)) {
    return {
      decision: 'blocked',
      reason: `Unknown workspace "${proposal.workspace}". Must be one of: ${validWorkspaces.join(', ')}`,
      risk_level: 'medium',
    };
  }

  const reviewPrompt = `You are CASA's Security Agent reviewing a code changeset proposed by the Manager Agent.

The Manager said this is what it's doing:
- Workspace: ${proposal.workspace}
- Task: ${proposal.task_summary}
- Rationale: ${proposal.rationale}

Files changed:
${proposal.files.map(f => `\n--- ${f.path} (${f.action}) ---\n${f.content.slice(0, 3000)}${f.content.length > 3000 ? '\n... [truncated]' : ''}`).join('\n')}

Evaluate:
1. Does the code actually do what the task summary says?
2. Are there obvious bugs or security issues (XSS, SQL injection, exposed credentials)?
3. Is anything destructive that wasn't justified?
4. Does it modify functionality outside the stated scope?

Respond with VALID JSON ONLY (no markdown):
{
  "decision": "approved" | "flagged_for_review" | "blocked",
  "reason": "short explanation",
  "risk_level": "low" | "medium" | "high"
}

Use:
- "approved" — code matches task, no issues
- "flagged_for_review" — code is fine but should be human-reviewed (new dependency, schema-adjacent change, large refactor)
- "blocked" — actively dangerous or off-task`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      messages: [{ role: 'user', content: reviewPrompt }],
    });

    const textBlock = response.content.find(b => b.type === 'text') as any;
    const raw = textBlock?.text ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as SecurityReview;

    if (!['approved', 'flagged_for_review', 'blocked'].includes(parsed.decision)) {
      return { decision: 'flagged_for_review', reason: 'Security review returned invalid decision; defaulting to manual review.', risk_level: 'medium' };
    }

    return parsed;
  } catch (e: any) {
    return {
      decision: 'flagged_for_review',
      reason: `Security review error: ${e.message}. Defaulting to manual review.`,
      risk_level: 'medium',
    };
  }
}

export function isAutoMergeEligible(
  proposal: AgentProposal,
  review: SecurityReview
): boolean {
  if (review.decision !== 'approved') return false;
  if (review.risk_level !== 'low') return false;

  if (proposal.files.length > 3) return false;
  const totalLines = proposal.files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
  if (totalLines > 500) return false;

  if (proposal.files.some(f => /\/page\.tsx$/.test(f.path) && f.action === 'create')) {
    return false;
  }

  if (proposal.files.some(f => /^src\/app\/api\//.test(f.path))) return false;
  if (proposal.files.some(f => /middleware\.ts$/.test(f.path))) return false;
  if (proposal.files.some(f => /package\.json$/.test(f.path))) return false;

  return true;
}
