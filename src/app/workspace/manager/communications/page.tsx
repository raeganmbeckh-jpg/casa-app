'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ─────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ─────────────────────────────────────────────────── */
type Channel = 'email' | 'sms';
type NotifStatus = 'sent' | 'delivered' | 'failed' | 'queued';
type EventType = 'rent_due' | 'receipt' | 'late_notice' | 'maintenance' | 'lease_expiring';

type Notification = {
  id: string;
  recipient: string;
  recipientEmail: string;
  channel: Channel;
  template: EventType;
  subject: string;
  date: string;
  status: NotifStatus;
};

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1',  recipient: 'Maya Hernandez',   recipientEmail: 'maya.h@example.com',    channel: 'email', template: 'receipt',        subject: 'Payment received -- thank you!',       date: '2026-04-01', status: 'delivered' },
  { id: 'n2',  recipient: 'Marcus Reynolds',  recipientEmail: 'mreynolds@example.com', channel: 'email', template: 'late_notice',     subject: 'Late rent notice',                     date: '2026-04-06', status: 'delivered' },
  { id: 'n3',  recipient: 'Marcus Reynolds',  recipientEmail: 'mreynolds@example.com', channel: 'sms',   template: 'late_notice',     subject: 'Late rent SMS reminder',               date: '2026-04-07', status: 'sent' },
  { id: 'n4',  recipient: 'Priya Kapoor',     recipientEmail: 'priya.k@example.com',   channel: 'email', template: 'rent_due',        subject: 'Rent reminder: payment due Apr 1',     date: '2026-03-29', status: 'delivered' },
  { id: 'n5',  recipient: "Liam O'Sullivan",  recipientEmail: 'liam.os@example.com',   channel: 'email', template: 'late_notice',     subject: 'Late rent notice',                     date: '2026-03-20', status: 'delivered' },
  { id: 'n6',  recipient: "Liam O'Sullivan",  recipientEmail: 'liam.os@example.com',   channel: 'sms',   template: 'late_notice',     subject: 'Urgent: rent overdue',                 date: '2026-03-22', status: 'failed' },
  { id: 'n7',  recipient: 'James Okafor',     recipientEmail: 'jokafor@example.com',   channel: 'email', template: 'receipt',         subject: 'Payment received -- thank you!',       date: '2026-04-01', status: 'delivered' },
  { id: 'n8',  recipient: 'Sasha Mendoza',    recipientEmail: 'smendoza@example.com',  channel: 'email', template: 'lease_expiring',  subject: 'Your lease expires in 60 days',        date: '2026-04-02', status: 'delivered' },
  { id: 'n9',  recipient: 'Daniel Park',      recipientEmail: 'dpark@example.com',     channel: 'email', template: 'maintenance',     subject: 'Maintenance update: HVAC repair',      date: '2026-04-05', status: 'sent' },
  { id: 'n10', recipient: 'Aaliyah Brooks',   recipientEmail: 'abrooks@example.com',   channel: 'email', template: 'rent_due',        subject: 'Rent reminder: payment due Apr 1',     date: '2026-03-29', status: 'delivered' },
  { id: 'n11', recipient: 'Yuki Tanaka',      recipientEmail: 'ytanaka@example.com',   channel: 'email', template: 'receipt',         subject: 'Payment received -- thank you!',       date: '2026-04-01', status: 'delivered' },
  { id: 'n12', recipient: 'Camille Dubois',   recipientEmail: 'cdubois@example.com',   channel: 'email', template: 'lease_expiring',  subject: 'Your lease expires in 90 days',        date: '2026-04-03', status: 'queued' },
  { id: 'n13', recipient: 'Priya Kapoor',     recipientEmail: 'priya.k@example.com',   channel: 'sms',   template: 'rent_due',        subject: 'Rent due reminder',                    date: '2026-03-29', status: 'delivered' },
  { id: 'n14', recipient: 'Marcus Reynolds',  recipientEmail: 'mreynolds@example.com', channel: 'email', template: 'maintenance',     subject: 'Maintenance update: disposal repair',  date: '2026-04-08', status: 'sent' },
  { id: 'n15', recipient: 'Maya Hernandez',   recipientEmail: 'maya.h@example.com',    channel: 'email', template: 'lease_expiring',  subject: 'Your lease expires in 30 days',        date: '2026-04-08', status: 'queued' },
];

const RECIPIENTS = [
  'Maya Hernandez', 'James Okafor', 'Priya Kapoor', 'Marcus Reynolds',
  'Sasha Mendoza', 'Daniel Park', 'Aaliyah Brooks', "Liam O'Sullivan",
  'Yuki Tanaka', 'Camille Dubois',
];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const templateLabels: Record<EventType, string> = {
  rent_due: 'Rent Due',
  receipt: 'Receipt',
  late_notice: 'Late Notice',
  maintenance: 'Maintenance',
  lease_expiring: 'Lease Expiring',
};

const templateColors: Record<EventType, string> = {
  rent_due: 'bg-blue-50 text-blue-800 border-blue-200',
  receipt: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  late_notice: 'bg-rose-50 text-rose-800 border-rose-200',
  maintenance: 'bg-amber-50 text-amber-800 border-amber-200',
  lease_expiring: 'bg-purple-50 text-purple-800 border-purple-200',
};

const statusColors: Record<NotifStatus, string> = {
  sent: 'bg-blue-50 text-blue-800 border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  failed: 'bg-rose-50 text-rose-800 border-rose-200',
  queued: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

/* ── KPIs ──────────────────────────────────────────────────── */
const sentThisMonth = MOCK_NOTIFICATIONS.filter((n) => n.date >= '2026-04-01').length;
const deliveredCount = MOCK_NOTIFICATIONS.filter((n) => n.status === 'delivered').length;
const deliveryRate = Math.round((deliveredCount / MOCK_NOTIFICATIONS.length) * 100);
const pendingCount = MOCK_NOTIFICATIONS.filter((n) => n.status === 'queued').length;
const templatesActive = new Set(MOCK_NOTIFICATIONS.map((n) => n.template)).size;

/* ── Mock env flags ────────────────────────────────────────── */
const HAS_RESEND = false;
const HAS_TWILIO = false;

/* ── Page ──────────────────────────────────────────────────── */
export default function CommunicationsPage() {
  const [eventFilter, setEventFilter] = useState<'all' | EventType>('all');
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendForm, setSendForm] = useState({
    recipient: RECIPIENTS[0],
    template: 'rent_due' as EventType,
    channel: 'email' as Channel,
    subject: '',
    body: '',
  });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const rows = useMemo(() => {
    let list = [...MOCK_NOTIFICATIONS];
    if (eventFilter !== 'all') list = list.filter((n) => n.template === eventFilter);
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [eventFilter]);

  const handleSend = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: `${sendForm.recipient.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
          channel: sendForm.channel,
          template: sendForm.template,
          subject: sendForm.subject || `[CASA] ${templateLabels[sendForm.template]}`,
          body: sendForm.body || `Notification: ${templateLabels[sendForm.template]}`,
          eventType: sendForm.template,
        }),
      });
      const data = await res.json();
      setSendResult(data.success ? 'Notification sent successfully' : `Error: ${data.error ?? 'Unknown'}`);
    } catch {
      setSendResult('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: INK, margin: 0 }}>
            Communications
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: DIM, marginTop: 4 }}>
            Notification log, templates, and delivery services
          </p>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 28 }}>
          {[
            { label: 'Sent this month', value: String(sentThisMonth) },
            { label: 'Delivery rate', value: `${deliveryRate}%` },
            { label: 'Pending', value: String(pendingCount) },
            { label: 'Templates active', value: String(templatesActive) },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: '20px 24px' }}
            >
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {kpi.label}
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: INK, margin: '4px 0 0' }}>
                {kpi.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Service Setup Cards */}
        {(!HAS_RESEND || !HAS_TWILIO) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 16, marginTop: 24 }}>
            {!HAS_RESEND && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: INK, margin: 0 }}>Connect Resend</h3>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: DIM, marginTop: 4 }}>
                      Add your RESEND_API_KEY to enable email delivery. Notifications will be logged but not delivered until connected.
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, background: 'rgba(17,17,17,0.04)', color: DIM, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    Not connected
                  </span>
                </div>
                <button
                  style={{ marginTop: 16, fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 500, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
                >
                  Setup Resend
                </button>
              </motion.div>
            )}
            {!HAS_TWILIO && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: INK, margin: 0 }}>Connect Twilio</h3>
                    <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: DIM, marginTop: 4 }}>
                      Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to enable SMS delivery.
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, background: 'rgba(17,17,17,0.04)', color: DIM, padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                    Not connected
                  </span>
                </div>
                <button
                  style={{ marginTop: 16, fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 500, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
                >
                  Setup Twilio
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, flexWrap: 'wrap', gap: 12 }}>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as 'all' | EventType)}
            style={{ fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 14px', background: '#fff', color: INK, outline: 'none' }}
          >
            <option value="all">All events</option>
            <option value="rent_due">Rent Due</option>
            <option value="receipt">Receipt</option>
            <option value="late_notice">Late Notice</option>
            <option value="maintenance">Maintenance</option>
            <option value="lease_expiring">Lease Expiring</option>
          </select>

          <button
            onClick={() => setShowSendForm(!showSendForm)}
            style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
          >
            {showSendForm ? 'Cancel' : 'Send Notification'}
          </button>
        </div>

        {/* Send Form */}
        {showSendForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: 24, marginTop: 16 }}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: INK, margin: '0 0 16px' }}>
              Send Notification
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Recipient</label>
                <select
                  value={sendForm.recipient}
                  onChange={(e) => setSendForm({ ...sendForm, recipient: e.target.value })}
                  style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', background: '#fff', color: INK, outline: 'none' }}
                >
                  {RECIPIENTS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Template</label>
                <select
                  value={sendForm.template}
                  onChange={(e) => setSendForm({ ...sendForm, template: e.target.value as EventType })}
                  style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', background: '#fff', color: INK, outline: 'none' }}
                >
                  {(Object.keys(templateLabels) as EventType[]).map((t) => (
                    <option key={t} value={t}>{templateLabels[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Channel</label>
                <select
                  value={sendForm.channel}
                  onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value as Channel })}
                  style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', background: '#fff', color: INK, outline: 'none' }}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Subject</label>
              <input
                value={sendForm.subject}
                onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                placeholder={`[CASA] ${templateLabels[sendForm.template]}`}
                style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', color: INK, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Body</label>
              <textarea
                value={sendForm.body}
                onChange={(e) => setSendForm({ ...sendForm, body: e.target.value })}
                rows={3}
                placeholder="Notification message..."
                style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', color: INK, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button
                onClick={handleSend}
                disabled={sending}
                style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 24px', cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1 }}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
              {sendResult && (
                <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: sendResult.includes('success') ? GREEN : RED }}>
                  {sendResult}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Notification Log Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, marginTop: 20, overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Recipient', 'Channel', 'Template', 'Subject', 'Date', 'Status'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: DIM, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((n) => (
                  <tr key={n.id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                    <td style={{ padding: '12px 16px', color: INK, fontWeight: 500 }}>{n.recipient}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: 'var(--font-geist-mono)',
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 6,
                        border: '1px solid',
                        ...(n.channel === 'email'
                          ? { background: 'rgba(59,130,246,0.06)', color: 'rgb(30,64,175)', borderColor: 'rgba(59,130,246,0.2)' }
                          : { background: 'rgba(147,51,234,0.06)', color: 'rgb(107,33,168)', borderColor: 'rgba(147,51,234,0.2)' }),
                      }}>
                        {n.channel.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={templateColors[n.template]} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid', display: 'inline-block' }}>
                        {templateLabels[n.template]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: MID, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.subject}
                    </td>
                    <td style={{ padding: '12px 16px', color: DIM, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>{fmtDate(n.date)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={statusColors[n.status]} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid', display: 'inline-block', textTransform: 'capitalize' }}>
                        {n.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
