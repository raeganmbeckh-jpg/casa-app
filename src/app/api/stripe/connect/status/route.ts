import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const accountId = req.nextUrl.searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'accountId query param is required' }, { status: 400 });
    }

    console.log('[Stripe Connect] Checking status for account:', accountId);

    const account = await stripe.accounts.retrieve(accountId);

    const onboarding_complete = account.charges_enabled && account.details_submitted;
    const payouts_enabled = account.payouts_enabled ?? false;

    const { error: dbError } = await supabase
      .from('payment_accounts')
      .update({
        charges_enabled: account.charges_enabled,
        payouts_enabled,
        onboarding_complete,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_account_id', accountId);

    if (dbError) {
      console.error('[Stripe Connect] DB error updating status:', dbError);
    }

    console.log('[Stripe Connect] Status:', { onboarding_complete, payouts_enabled });

    return NextResponse.json({ onboarding_complete, payouts_enabled });
  } catch (error) {
    console.error('[Stripe Connect] Status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
