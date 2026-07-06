import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('[Stripe Webhook] Received event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const leaseId = session.metadata?.lease_id;
        const paymentType = session.metadata?.payment_type || 'rent';
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        console.log('[Stripe Webhook] Checkout completed:', { leaseId, paymentIntentId });

        if (!leaseId) {
          console.warn('[Stripe Webhook] No lease_id in session metadata, skipping');
          break;
        }

        // Look up the lease to get property_id and tenant_id
        const { data: lease, error: leaseError } = await supabase
          .from('leases')
          .select('id, property_id, tenant_id, monthly_rent')
          .eq('id', leaseId)
          .single();

        if (leaseError || !lease) {
          console.error('[Stripe Webhook] Lease lookup failed:', leaseError);
          break;
        }

        const amountPaid = (session.amount_total ?? 0) / 100;

        // Insert or update rent_payments
        const { error: paymentError } = await supabase.from('rent_payments').upsert(
          {
            lease_id: leaseId,
            property_id: lease.property_id,
            tenant_id: lease.tenant_id,
            amount: amountPaid,
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntentId,
            payment_type: paymentType,
            month: new Date().toISOString().slice(0, 7),
          },
          { onConflict: 'stripe_payment_intent_id' }
        );

        if (paymentError) {
          console.error('[Stripe Webhook] Error saving rent_payment:', paymentError);
        }

        // Insert transaction
        const { error: txError } = await supabase.from('transactions').insert({
          property_id: lease.property_id,
          type: 'income',
          category: 'rent',
          amount: amountPaid,
          date: new Date().toISOString().slice(0, 10),
          description: `${paymentType === 'deposit' ? 'Security deposit' : 'Rent'} payment received`,
        });

        if (txError) {
          console.error('[Stripe Webhook] Error inserting transaction:', txError);
        }

        // Insert alert
        const { error: alertError } = await supabase.from('alerts').insert({
          property_id: lease.property_id,
          type: 'overdue_rent',
          message: `Rent received: $${amountPaid.toFixed(2)} for lease ${leaseId}`,
          severity: 'info',
          created_at: new Date().toISOString(),
          dismissed: false,
        });

        if (alertError) {
          console.error('[Stripe Webhook] Error inserting alert:', alertError);
        }

        console.log('[Stripe Webhook] Payment recorded successfully');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const leaseId = paymentIntent.metadata?.lease_id;

        console.log('[Stripe Webhook] Payment failed:', paymentIntent.id, { leaseId });

        if (leaseId) {
          // Update rent_payments status to failed
          const { error: updateError } = await supabase
            .from('rent_payments')
            .update({ status: 'failed' })
            .eq('stripe_payment_intent_id', paymentIntent.id);

          if (updateError) {
            console.error('[Stripe Webhook] Error updating failed payment:', updateError);
          }

          // Look up lease for property_id
          const { data: lease } = await supabase
            .from('leases')
            .select('property_id')
            .eq('id', leaseId)
            .single();

          // Insert failure alert
          const { error: alertError } = await supabase.from('alerts').insert({
            property_id: lease?.property_id ?? null,
            type: 'overdue_rent',
            message: `Payment failed for lease ${leaseId}: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
            severity: 'critical',
            created_at: new Date().toISOString(),
            dismissed: false,
          });

          if (alertError) {
            console.error('[Stripe Webhook] Error inserting failure alert:', alertError);
          }
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;

        console.log('[Stripe Webhook] Account updated:', account.id);

        const onboarding_complete = account.charges_enabled && account.details_submitted;

        const { error: dbError } = await supabase
          .from('payment_accounts')
          .update({
            onboarding_complete,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled ?? false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', account.id);

        if (dbError) {
          console.error('[Stripe Webhook] Error updating payment_accounts:', dbError);
        }
        break;
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
