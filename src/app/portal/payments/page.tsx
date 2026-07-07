'use client';

import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

type PaymentStatus = 'paid' | 'pending' | 'failed';
type PaymentMethod = 'card' | 'ach';

type Payment = {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  confirmation: string;
};

const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', date: '2026-06-01', amount: 2850, method: 'ach', status: 'paid', confirmation: 'TXN-94812' },
  { id: 'p2', date: '2026-05-01', amount: 2850, method: 'ach', status: 'paid', confirmation: 'TXN-88341' },
  { id: 'p3', date: '2026-04-01', amount: 2850, method: 'card', status: 'paid', confirmation: 'TXN-81290' },
  { id: 'p4', date: '2026-03-01', amount: 2850, method: 'ach', status: 'paid', confirmation: 'TXN-74618' },
  { id: 'p5', date: '2026-02-01', amount: 2850, method: 'card', status: 'paid', confirmation: 'TXN-67503' },
  { id: 'p6', date: '2026-01-01', amount: 2850, method: 'ach', status: 'paid', confirmation: 'TXN-60192' },
  { id: 'p7', date: '2025-12-01', amount: 2850, method: 'card', status: 'failed', confirmation: 'TXN-53881' },
  { id: 'p8', date: '2025-11-01', amount: 2850, method: 'ach', status: 'paid', confirmation: 'TXN-47250' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (s: string) => {
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const totalPaidYTD = MOCK_PAYMENTS.filter(
  (p) => p.status === 'paid' && p.date >= '2026-01-01'
).reduce((sum, p) => sum + p.amount, 0);

const paidCount = MOCK_PAYMENTS.filter((p) => p.status === 'paid').length;
const onTimeRate = Math.round((paidCount / MOCK_PAYMENTS.length) * 100);

const STATUS_STYLES: Record<PaymentStatus, { bg: string; color: string; label: string }> = {
  paid: { bg: 'rgba(21,128,61,0.1)', color: GREEN, label: 'Paid' },
  pending: { bg: 'rgba(249,217,106,0.25)', color: '#92700C', label: 'Pending' },
  failed: { bg: 'rgba(185,28,28,0.1)', color: RED, label: 'Failed' },
};

const METHOD_STYLES: Record<PaymentMethod, { label: string }> = {
  card: { label: 'Card' },
  ach: { label: 'ACH' },
};

export default function PaymentsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 28,
          fontWeight: 500,
          color: INK,
          margin: 0,
          letterSpacing: '-0.02em',
        }}
      >
        Payments
      </h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Paid YTD', value: fmtMoney(totalPaidYTD) },
          { label: 'On-time rate', value: `${onTimeRate}%` },
          { label: 'Next due', value: 'Jul 1, 2026' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 10,
              padding: '18px 16px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 11,
                color: DIM,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {kpi.label}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: 20,
                fontWeight: 500,
                color: INK,
                margin: '8px 0 0',
              }}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Payment table */}
      <div
        style={{
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 0.7fr 0.7fr 0.8fr',
            padding: '12px 20px',
            backgroundColor: CREAM,
            borderBottom: `1px solid ${HAIRLINE}`,
          }}
        >
          {['Date', 'Amount', 'Method', 'Status', 'Receipt'].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 11,
                fontWeight: 600,
                color: DIM,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {MOCK_PAYMENTS.map((payment, i) => {
          const status = STATUS_STYLES[payment.status];
          const method = METHOD_STYLES[payment.method];
          return (
            <motion.div
              key={payment.id}
              whileHover={{ backgroundColor: CREAM }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 0.7fr 0.7fr 0.8fr',
                padding: '14px 20px',
                alignItems: 'center',
                borderBottom: i < MOCK_PAYMENTS.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                cursor: 'default',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 13,
                  color: INK,
                }}
              >
                {fmtDate(payment.date)}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: 13,
                  color: INK,
                }}
              >
                {fmtMoney(payment.amount)}
              </span>
              <span>
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '3px 8px',
                    borderRadius: 4,
                    backgroundColor: CREAM,
                    color: MID,
                  }}
                >
                  {method.label}
                </span>
              </span>
              <span>
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 100,
                    backgroundColor: status.bg,
                    color: status.color,
                  }}
                >
                  {status.label}
                </span>
              </span>
              <motion.button
                whileHover={{ opacity: 0.7 }}
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 12,
                  color: DIM,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                {payment.confirmation}
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
