import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  /* ── Auth guard ──────────────────────────────────────────────── */
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();
  let appliedCount = 0;

  try {
    /* ── 1. Fetch active leases with late-fee rules ────────────── */
    const { data: leases, error: leaseErr } = await supabase
      .from('leases')
      .select('id, tenant_id, landlord_id, rent_amount, late_fee_days, property_id, unit')
      .eq('status', 'active');

    if (leaseErr) throw leaseErr;
    if (!leases || leases.length === 0) {
      console.log('[late-fees] No active leases found.');
      return NextResponse.json({ applied: 0 });
    }

    for (const lease of leases) {
      const graceDays = lease.late_fee_days ?? 5; // default 5-day grace

      /* ── 2. Find unpaid rent_payments past the grace period ── */
      const { data: overduePayments, error: payErr } = await supabase
        .from('rent_payments')
        .select('id, due_date, amount, lease_id')
        .eq('lease_id', lease.id)
        .neq('status', 'paid')
        .is('late_fee_applied', null);

      if (payErr) {
        console.error(`[late-fees] Error querying rent_payments for lease ${lease.id}:`, payErr);
        continue;
      }

      if (!overduePayments || overduePayments.length === 0) continue;

      for (const payment of overduePayments) {
        const dueDate = new Date(payment.due_date);
        const deadlineDate = new Date(dueDate);
        deadlineDate.setDate(deadlineDate.getDate() + graceDays);

        if (now <= deadlineDate) continue; // still within grace period

        /* ── 3. Calculate late fee: $50 or 5% of rent, whichever is greater ── */
        const percentFee = lease.rent_amount * 0.05;
        const lateFee = Math.max(50, percentFee);

        console.log(
          `[late-fees] Applying $${lateFee.toFixed(2)} late fee — ` +
          `lease ${lease.id}, payment ${payment.id}, ` +
          `due ${payment.due_date}, grace ${graceDays}d`
        );

        /* ── 4. Insert transaction record ──────────────────── */
        const { error: txErr } = await supabase.from('transactions').insert({
          lease_id: lease.id,
          tenant_id: lease.tenant_id,
          landlord_id: lease.landlord_id,
          property_id: lease.property_id,
          type: 'income',
          category: 'late_fee',
          amount: lateFee,
          description: `Late fee for rent due ${payment.due_date} (${graceDays}-day grace exceeded)`,
          date: now.toISOString().split('T')[0],
          created_at: now.toISOString(),
        });

        if (txErr) {
          console.error(`[late-fees] Failed to insert transaction for payment ${payment.id}:`, txErr);
          continue;
        }

        /* ── 5. Mark payment as late-fee-applied ───────────── */
        await supabase
          .from('rent_payments')
          .update({ late_fee_applied: true, late_fee_amount: lateFee })
          .eq('id', payment.id);

        /* ── 6. Create alerts for tenant and landlord ──────── */
        const alertBase = {
          title: 'Late Fee Applied',
          message: `A late fee of $${lateFee.toFixed(2)} has been applied for rent due ${payment.due_date}.`,
          type: 'late_fee',
          severity: 'warning',
          lease_id: lease.id,
          property_id: lease.property_id,
          created_at: now.toISOString(),
          read: false,
        };

        const { error: alertErr } = await supabase.from('alerts').insert([
          { ...alertBase, user_id: lease.tenant_id },
          { ...alertBase, user_id: lease.landlord_id },
        ]);

        if (alertErr) {
          console.error(`[late-fees] Failed to insert alerts for payment ${payment.id}:`, alertErr);
        }

        appliedCount++;
      }
    }

    console.log(`[late-fees] Done. Applied ${appliedCount} late fee(s).`);
    return NextResponse.json({ applied: appliedCount });
  } catch (error) {
    console.error('[late-fees] Cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
