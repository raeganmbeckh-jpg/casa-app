// Email notification helper for the CASA agent system
// Uses Resend to send alerts to Raegan

const ALERT_EMAIL = 'raeganmbeckh@gmail.com';
const FROM_ADDRESS = 'CASA Agent <onboarding@resend.dev>';

export async function sendAlert({ subject, body }: { subject: string; body: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[notify] RESEND_API_KEY not set — skipping email');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [ALERT_EMAIL],
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      console.error('[notify] Resend error:', res.status, await res.text());
    }
  } catch (e) {
    console.error('[notify] Failed to send email:', e);
  }
}
