import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[Autopay] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripe();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const today = new Date();
    const dayOfMonth = today.getDate();
    const currentMonth = today.toISOString().slice(0, 7);

    console.log('[Autopay] Running for day:', dayOfMonth, 'month:', currentMonth);

    // Fetch active autopay enrollments for today's day
    const { data: enrollments, error: enrollError } = await supabase
      .from('autopay_enrollments')
      .select('*, leases(id, property_id, tenant_id, monthly_rent)')
      .eq('active', true)
      .eq('day_of_month', dayOfMonth);

    if (enrollError) {
      console.error('[Autopay] Error fetching enrollments:', enrollError);
      return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 });
    }

    if (!enrollments || enrollments.length === 0) {
      console.log('[Autopay] No enrollments scheduled for today');
      return NextResponse.json({ processed: 0, results: [] });
    }

    console.log('[Autopay] Found', enrollments.length, 'enrollments to process');

    const results: Array<{ lease_id: string; status: string; error?: string }> = [];

    for (const enrollment of enrollments) {
      const lease = enrollment.leases;

      if (!lease) {
        console.warn('[Autopay] No lease found for enrollment:', enrollment.id);
        results.push({ lease_id: enrollment.lease_id, status: 'skipped', error: 'Lease not found' });
        continue;
      }

      try {
        // Check if rent already paid this month
        const { data: existingPayment } = await supabase
          .from('rent_payments')
          .select('id')
          .eq('lease_id', lease.id)
          .eq('month', currentMonth)
          .eq('status', 'paid')
          .maybeSingle();

        if (existingPayment) {
          console.log('[Autopay] Rent already paid for lease:', lease.id, 'month:', currentMonth);
          results.push({ lease_id: lease.id, status: 'already_paid' });
          continue;
        }

        // Create off-session payment intent using saved payment method
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(lease.monthly_rent * 100),
          currency: 'usd',
          customer: enrollment.stripe_customer_id,
          payment_method: enrollment.stripe_payment_method_id,
          off_session: true,
          confirm: true,
          metadata: {
            lease_id: lease.id,
            payment_type: 'rent',
            autopay: 'true',
          },
        });

        console.log('[Autopay] PaymentIntent created:', paymentIntent.id, 'for lease:', lease.id);

        // Insert rent_payments row
        const { error: insertError } = await supabase.from('rent_payments').insert({
          lease_id: lease.id,
          property_id: lease.property_id,
          tenant_id: lease.tenant_id,
          amount: lease.monthly_rent,
          status: paymentIntent.status === 'succeeded' ? 'paid' : 'pending',
          paid_at: paymentIntent.status === 'succeeded' ? new Date().toISOString() : null,
          stripe_payment_intent_id: paymentIntent.id,
          payment_type: 'rent',
          month: currentMonth,
        });

        if (insertError) {
          console.error('[Autopay] Error inserting rent_payment:', insertError);
        }

        results.push({ lease_id: lease.id, status: 'processed' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Autopay] Error processing lease:', lease.id, message);
        results.push({ lease_id: lease.id, status: 'failed', error: message });
      }
    }

    console.log('[Autopay] Complete. Processed:', results.length, 'Results:', JSON.stringify(results));

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error('[Autopay] Fatal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
