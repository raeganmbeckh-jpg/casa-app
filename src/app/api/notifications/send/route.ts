import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const {
      recipientEmail,
      recipientPhone,
      channel,
      template,
      subject,
      body,
      eventType,
      propertyId,
      tenantId,
    } = await req.json();

    if (!recipientEmail || !channel || !template || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientEmail, channel, template, body' },
        { status: 400 },
      );
    }

    if (channel !== 'email' && channel !== 'sms') {
      return NextResponse.json(
        { error: 'channel must be "email" or "sms"' },
        { status: 400 },
      );
    }

    if (channel === 'sms' && !recipientPhone) {
      return NextResponse.json(
        { error: 'recipientPhone is required for SMS channel' },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const notificationId = crypto.randomUUID();
    let deliveryStatus: 'sent' | 'queued' | 'logged' = 'logged';
    let deliveryError: string | null = null;
    let externalId: string | null = null;

    // ── Email via Resend ──────────────────────────────────────
    if (channel === 'email' && process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL ?? 'CASA <notifications@casa.app>',
            to: [recipientEmail],
            subject: subject ?? `[CASA] ${template}`,
            html: body,
          }),
        });

        const resendData = await resendRes.json();

        if (resendRes.ok && resendData.id) {
          deliveryStatus = 'sent';
          externalId = resendData.id;
        } else {
          deliveryError = resendData.message ?? 'Resend API error';
        }
      } catch (err) {
        deliveryError = err instanceof Error ? err.message : 'Resend request failed';
      }
    }

    // ── SMS via Twilio ────────────────────────────────────────
    if (channel === 'sms' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
        const credentials = Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
        ).toString('base64');

        const params = new URLSearchParams();
        params.append('To', recipientPhone!);
        params.append('From', process.env.TWILIO_FROM_NUMBER ?? '');
        params.append('Body', body);

        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const twilioData = await twilioRes.json();

        if (twilioRes.ok && twilioData.sid) {
          deliveryStatus = 'sent';
          externalId = twilioData.sid;
        } else {
          deliveryError = twilioData.message ?? 'Twilio API error';
        }
      } catch (err) {
        deliveryError = err instanceof Error ? err.message : 'Twilio request failed';
      }
    }

    // ── Log to notification_log table ─────────────────────────
    const logEntry = {
      id: notificationId,
      recipient_email: recipientEmail,
      recipient_phone: recipientPhone ?? null,
      channel,
      template,
      subject: subject ?? null,
      body,
      event_type: eventType ?? null,
      property_id: propertyId ?? null,
      tenant_id: tenantId ?? null,
      status: deliveryError ? 'failed' : deliveryStatus,
      external_id: externalId,
      error: deliveryError,
      created_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabase
      .from('notification_log')
      .insert(logEntry);

    if (dbError) {
      console.error('[Notifications] DB log error:', dbError);
    }

    // ── Determine response note ───────────────────────────────
    const hasEmailService = !!process.env.RESEND_API_KEY;
    const hasSmsService = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

    if (
      (channel === 'email' && !hasEmailService) ||
      (channel === 'sms' && !hasSmsService)
    ) {
      return NextResponse.json({
        success: true,
        notificationId,
        note: 'No delivery service configured',
      });
    }

    if (deliveryError) {
      return NextResponse.json(
        { success: false, notificationId, error: deliveryError },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      notificationId,
      status: deliveryStatus,
      externalId,
    });
  } catch (err) {
    console.error('[Notifications] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
