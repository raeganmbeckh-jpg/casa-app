'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const GREEN = '#15803D';

const TENANT = {
  name: 'Maya Hernandez',
  unit: 'A-204',
  rent: 2850,
  nextDue: '2026-07-01',
  balance: 2850,
};

const RECENT_ACTIVITY = [
  { id: '1', type: 'payment' as const, description: 'June rent payment', amount: 2850, date: '2026-06-01', status: 'paid' },
  { id: '2', type: 'maintenance' as const, description: 'Dishwasher repair - resolved', date: '2026-05-28', status: 'resolved' },
  { id: '3', type: 'payment' as const, description: 'May rent payment', amount: 2850, date: '2026-05-01', status: 'paid' },
  { id: '4', type: 'maintenance' as const, description: 'HVAC filter replacement - in progress', date: '2026-05-15', status: 'in_progress' },
  { id: '5', type: 'payment' as const, description: 'April rent payment', amount: 2850, date: '2026-04-01', status: 'paid' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (s: string) => {
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function getDaysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PortalHomePage() {
  const [autopay, setAutopay] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const daysUntil = getDaysUntil(TENANT.nextDue);

  const handlePay = async () => {
    setPayLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: TENANT.balance, unit: TENANT.unit }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // handle error
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div>
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
          Welcome back, Maya
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            color: DIM,
            margin: '6px 0 0',
          }}
        >
          Unit {TENANT.unit}
        </p>
      </div>

      {/* Balance card */}
      <div
        style={{
          background: INK,
          borderRadius: 12,
          padding: '28px 24px',
          color: '#FFFFFF',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 12,
            opacity: 0.6,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Amount Due
        </p>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 40,
            fontWeight: 500,
            margin: '8px 0 16px',
            letterSpacing: '-0.02em',
          }}
        >
          {fmtMoney(TENANT.balance)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, opacity: 0.5, margin: 0 }}>
              Next due
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, margin: '2px 0 0' }}>
              {fmtDate(TENANT.nextDue)}
            </p>
          </div>
          <div
            style={{
              width: 1,
              height: 28,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          />
          <div>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, opacity: 0.5, margin: 0 }}>
              Days until due
            </p>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, margin: '2px 0 0' }}>
              {daysUntil > 0 ? daysUntil : 'Past due'}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePay}
          disabled={payLoading}
          style={{
            width: '100%',
            padding: '14px 0',
            backgroundColor: BUTTER,
            color: INK,
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          {payLoading ? 'Redirecting...' : 'Pay Now'}
        </motion.button>
      </div>

      {/* Autopay toggle */}
      <div
        style={{
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 14,
              fontWeight: 500,
              color: INK,
              margin: 0,
            }}
          >
            Autopay
          </p>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 12,
              color: DIM,
              margin: '4px 0 0',
            }}
          >
            {autopay ? 'Your rent is paid automatically each month' : 'Enable to automatically pay rent on the due date'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAutopay(!autopay)}
          style={{
            width: 48,
            height: 28,
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: autopay ? GREEN : 'rgba(17,17,17,0.15)',
            position: 'relative',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}
        >
          <motion.div
            animate={{ x: autopay ? 22 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: '#FFFFFF',
              position: 'absolute',
              top: 3,
              left: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          />
        </motion.button>
      </div>

      {/* Recent activity */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            fontWeight: 600,
            color: INK,
            margin: '0 0 16px',
            letterSpacing: '0.01em',
          }}
        >
          Recent Activity
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {RECENT_ACTIVITY.map((item, i) => (
            <motion.div
              key={item.id}
              whileHover={{ backgroundColor: CREAM }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: item.type === 'payment' ? GREEN : BUTTER,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: 13,
                      color: INK,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: 11,
                      color: DIM,
                      margin: '2px 0 0',
                    }}
                  >
                    {fmtDate(item.date)}
                  </p>
                </div>
              </div>
              {item.amount && (
                <span
                  style={{
                    fontFamily: 'var(--font-geist-mono)',
                    fontSize: 13,
                    color: MID,
                  }}
                >
                  {fmtMoney(item.amount)}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
