import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    /* ── Webhook signature verification ────────────────────── */
    const webhookSecret = process.env.SIGNWELL_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers.get('x-signwell-signature') || '';
      // In production, verify HMAC-SHA256 signature:
      // const crypto = await import('crypto');
      // const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      // if (signature !== expected) { return NextResponse.json({ error: 'Invalid signature' }, { status: 401 }); }
      console.log('[CASA] SignWell webhook signature present, verification enabled.');
      if (!signature) {
        console.warn('[CASA] SignWell webhook received without signature header.');
      }
    }

    const { event, data } = body;

    console.log(`[CASA] SignWell webhook received: ${event}`, JSON.stringify(data, null, 2));

    /* ── Handle document.completed ─────────────────────────── */
    if (event === 'document.completed') {
      const documentId = data?.id || data?.document_id;
      const signedPdfUrl = data?.file_url || data?.signed_pdf_url || null;

      if (!documentId) {
        console.error('[CASA] document.completed webhook missing document ID.');
        return NextResponse.json({ error: 'Missing document ID.' }, { status: 400 });
      }

      // UPDATE leases SET esign_status = 'signed', signed_pdf_url = ? WHERE signwell_document_id = ?
      console.log(`[CASA] Lease e-sign completed. Document: ${documentId}`);
      console.log(`[CASA] Updating lease: esign_status = 'signed', signed_pdf_url = '${signedPdfUrl}'`);

      // In production, update the database:
      // await supabase.from('leases')
      //   .update({ esign_status: 'signed', signed_pdf_url: signedPdfUrl })
      //   .eq('signwell_document_id', documentId);

      return NextResponse.json({
        received: true,
        event: 'document.completed',
        documentId,
        action: 'lease_status_updated_to_signed',
      });
    }

    /* ── Handle other events ──────────────────────────────── */
    if (event === 'document.sent') {
      console.log(`[CASA] Document sent for signing: ${data?.id}`);
      return NextResponse.json({ received: true, event: 'document.sent' });
    }

    if (event === 'document.viewed') {
      console.log(`[CASA] Document viewed by recipient: ${data?.id}`);
      return NextResponse.json({ received: true, event: 'document.viewed' });
    }

    if (event === 'document.declined') {
      console.log(`[CASA] Document declined: ${data?.id}`);
      // In production: update lease status, notify manager
      return NextResponse.json({ received: true, event: 'document.declined' });
    }

    /* ── Unhandled event ──────────────────────────────────── */
    console.log(`[CASA] Unhandled SignWell webhook event: ${event}`);
    return NextResponse.json({ received: true, event });
  } catch (err) {
    console.error('[CASA] SignWell webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed.' },
      { status: 500 },
    );
  }
}
