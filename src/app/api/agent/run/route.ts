// Vercel cron endpoint for the CASA Manager Agent
// Triggered on the schedule defined in vercel.json
// Protected by CRON_SECRET to prevent unauthorized triggers

import { NextRequest, NextResponse } from 'next/server';
import { runManagerAgent } from '@/agents/manager';

export const maxDuration = 300; // 5 minutes — needed for code generation + commits
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verify request is from Vercel cron
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runManagerAgent();
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error('Agent run error:', err);
    return NextResponse.json(
      { ok: false, error: err.message ?? String(err) },
      { status: 500 }
    );
  }
}
