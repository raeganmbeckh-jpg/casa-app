import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    console.log('[Stripe Connect] Creating Express account for user:', userId);

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log('[Stripe Connect] Account created:', account.id);

    const { error: dbError } = await supabase.from('payment_accounts').upsert({
      user_id: userId,
      stripe_account_id: account.id,
      onboarding_complete: false,
      charges_enabled: false,
      payouts_enabled: false,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (dbError) {
      console.error('[Stripe Connect] DB error saving account:', dbError);
      return NextResponse.json({ error: 'Failed to save payment account' }, { status: 500 });
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.nextUrl.origin}/settings/payments?refresh=true`,
      return_url: `${req.nextUrl.origin}/settings/payments?onboarding=complete`,
      type: 'account_onboarding',
    });

    console.log('[Stripe Connect] Account link created for onboarding');

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('[Stripe Connect] Onboard error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
