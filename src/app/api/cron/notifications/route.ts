import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

async function sendNotification(payload: Record<string, unknown>, baseUrl: string) {
  try {
    const res = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error('[CronNotifications] Send failed:', err);
    return { success: false, error: String(err) };
  }
}

export async function GET(req: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[CronNotifications] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);

    const summary = {
      rent_due_reminders: 0,
      receipts: 0,
      late_notices: 0,
      maintenance_updates: 0,
      lease_expiring: 0,
      errors: 0,
    };

    // ── 1. Rent due in 3 days ──────────────────────────────
    const threeDaysOut = new Date(today);
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);
    const dueDateISO = threeDaysOut.toISOString().slice(0, 10);

    const { data: upcomingLeases } = await supabase
      .from('leases')
      .select('id, tenant_id, property_id, monthly_rent, tenants(email, first_name, last_name, phone)')
      .eq('status', 'active')
      .eq('rent_due_day', threeDaysOut.getDate());

    if (upcomingLeases) {
      for (const lease of upcomingLeases) {
        const tenant = lease.tenants as unknown as unknown as Record<string, string> | null;
        if (!tenant?.email) continue;

        const result = await sendNotification({
          recipientEmail: tenant.email,
          recipientPhone: tenant.phone ?? undefined,
          channel: 'email',
          template: 'rent_due',
          subject: `Rent reminder: payment due ${dueDateISO}`,
          body: `<p>Hi ${tenant.first_name},</p><p>This is a friendly reminder that your rent of $${lease.monthly_rent} is due on ${dueDateISO}.</p>`,
          eventType: 'rent_due',
          propertyId: lease.property_id,
          tenantId: lease.tenant_id,
        }, baseUrl);

        if (result.success) summary.rent_due_reminders++;
        else summary.errors++;
      }
    }

    // ── 2. Rent received (receipt) ─────────────────────────
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('id, lease_id, amount, tenant_id, property_id, tenants(email, first_name, phone)')
      .eq('status', 'completed')
      .gte('created_at', new Date(today.getTime() - 3600000).toISOString())
      .is('receipt_sent', null);

    if (recentPayments) {
      for (const payment of recentPayments) {
        const tenant = payment.tenants as unknown as Record<string, string> | null;
        if (!tenant?.email) continue;

        const result = await sendNotification({
          recipientEmail: tenant.email,
          channel: 'email',
          template: 'receipt',
          subject: 'Payment received -- thank you!',
          body: `<p>Hi ${tenant.first_name},</p><p>We received your payment of $${payment.amount}. Thank you!</p>`,
          eventType: 'receipt',
          propertyId: payment.property_id,
          tenantId: payment.tenant_id,
        }, baseUrl);

        if (result.success) {
          summary.receipts++;
          await supabase
            .from('payments')
            .update({ receipt_sent: true })
            .eq('id', payment.id);
        } else {
          summary.errors++;
        }
      }
    }

    // ── 3. Late notices (past grace period) ────────────────
    const { data: overdueLeases } = await supabase
      .from('leases')
      .select('id, tenant_id, property_id, monthly_rent, grace_period_days, rent_due_day, tenants(email, first_name, phone)')
      .eq('status', 'active');

    if (overdueLeases) {
      for (const lease of overdueLeases) {
        const graceDays = lease.grace_period_days ?? 5;
        const dueDay = lease.rent_due_day ?? 1;
        const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
        const graceEnd = new Date(dueDate);
        graceEnd.setDate(graceEnd.getDate() + graceDays);

        if (today.toISOString().slice(0, 10) !== graceEnd.toISOString().slice(0, 10)) continue;

        // Check if rent is actually unpaid
        const { data: paidThisMonth } = await supabase
          .from('payments')
          .select('id')
          .eq('lease_id', lease.id)
          .eq('status', 'completed')
          .gte('created_at', `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`)
          .limit(1);

        if (paidThisMonth && paidThisMonth.length > 0) continue;

        const tenant = lease.tenants as unknown as unknown as Record<string, string> | null;
        if (!tenant?.email) continue;

        const result = await sendNotification({
          recipientEmail: tenant.email,
          recipientPhone: tenant.phone ?? undefined,
          channel: 'email',
          template: 'late_notice',
          subject: 'Late rent notice',
          body: `<p>Hi ${tenant.first_name},</p><p>Your rent of $${lease.monthly_rent} is past the grace period and is now considered late. Late fees may apply. Please submit payment as soon as possible.</p>`,
          eventType: 'late_notice',
          propertyId: lease.property_id,
          tenantId: lease.tenant_id,
        }, baseUrl);

        if (result.success) summary.late_notices++;
        else summary.errors++;
      }
    }

    // ── 4. Maintenance status changes ──────────────────────
    const oneHourAgo = new Date(today.getTime() - 3600000).toISOString();

    const { data: updatedTickets } = await supabase
      .from('maintenance_requests')
      .select('id, title, status, property_id, tenant_id, tenants(email, first_name, phone)')
      .gte('updated_at', oneHourAgo)
      .in('status', ['in_progress', 'resolved']);

    if (updatedTickets) {
      for (const ticket of updatedTickets) {
        const tenant = ticket.tenants as unknown as Record<string, string> | null;
        if (!tenant?.email) continue;

        const statusLabel = ticket.status === 'resolved' ? 'resolved' : 'in progress';

        const result = await sendNotification({
          recipientEmail: tenant.email,
          channel: 'email',
          template: 'maintenance',
          subject: `Maintenance update: ${ticket.title}`,
          body: `<p>Hi ${tenant.first_name},</p><p>Your maintenance request "${ticket.title}" has been updated to <strong>${statusLabel}</strong>.</p>`,
          eventType: 'maintenance',
          propertyId: ticket.property_id,
          tenantId: ticket.tenant_id,
        }, baseUrl);

        if (result.success) summary.maintenance_updates++;
        else summary.errors++;
      }
    }

    // ── 5. Leases expiring in 90/60/30 days ────────────────
    const expirationWindows = [90, 60, 30];

    for (const daysOut of expirationWindows) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysOut);
      const targetISO = targetDate.toISOString().slice(0, 10);

      const { data: expiringLeases } = await supabase
        .from('leases')
        .select('id, tenant_id, property_id, end_date, tenants(email, first_name, phone)')
        .eq('status', 'active')
        .eq('end_date', targetISO);

      if (expiringLeases) {
        for (const lease of expiringLeases) {
          const tenant = lease.tenants as unknown as unknown as Record<string, string> | null;
          if (!tenant?.email) continue;

          const result = await sendNotification({
            recipientEmail: tenant.email,
            channel: 'email',
            template: 'lease_expiring',
            subject: `Your lease expires in ${daysOut} days`,
            body: `<p>Hi ${tenant.first_name},</p><p>Your lease is set to expire on ${targetISO}. Please reach out to discuss renewal options.</p>`,
            eventType: 'lease_expiring',
            propertyId: lease.property_id,
            tenantId: lease.tenant_id,
          }, baseUrl);

          if (result.success) summary.lease_expiring++;
          else summary.errors++;
        }
      }
    }

    console.log('[CronNotifications] Summary:', summary);

    return NextResponse.json({
      success: true,
      timestamp: todayISO,
      summary,
    });
  } catch (err) {
    console.error('[CronNotifications] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
