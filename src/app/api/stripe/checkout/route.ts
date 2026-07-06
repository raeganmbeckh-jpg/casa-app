import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();

    const { leaseId, amount, type, tenantEmail, connectedAccountId, successUrl, cancelUrl } =
      await req.json();

    if (!leaseId || !amount || !type || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'leaseId, amount, type, successUrl, and cancelUrl are required' },
        { status: 400 }
      );
    }

    console.log('[Stripe Checkout] Creating session:', { leaseId, amount, type });

    const label = type === 'deposit' ? 'Security Deposit' : 'Rent Payment';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'us_bank_account'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: label },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        lease_id: leaseId,
        payment_type: type,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (tenantEmail) {
      sessionParams.customer_email = tenantEmail;
    }

    if (connectedAccountId) {
      sessionParams.payment_intent_data = {
        transfer_data: {
          destination: connectedAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[Stripe Checkout] Session created:', session.id);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
