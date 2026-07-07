'use client';

import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const GREEN = '#15803D';

const LEASE = {
  property: '1420 Pacific Coast Highway',
  unit: 'A-204',
  city: 'San Diego, CA 92101',
  startDate: '2025-08-01',
  endDate: '2026-07-31',
  monthlyRent: 2850,
  securityDeposit: 5700,
  lateFeeGrace: 5,
  lateFeeAmount: 150,
  eSignStatus: 'signed' as const,
  tenants: ['Maya Hernandez'],
};

const DOCUMENTS = [
  { id: 'd1', name: 'Lease Agreement', type: 'PDF', size: '2.4 MB', date: '2025-07-15' },
  { id: 'd2', name: 'Move-In Checklist', type: 'PDF', size: '840 KB', date: '2025-07-28' },
  { id: 'd3', name: 'Community Rules & Regulations', type: 'PDF', size: '1.1 MB', date: '2025-07-15' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (s: string) => {
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const fmtShortDate = (s: string) => {
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '12px 0',
        borderBottom: `1px solid ${HAIRLINE}`,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 13,
          color: DIM,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 13,
          fontWeight: 500,
          color: INK,
          textAlign: 'right',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function LeasePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          Lease
        </h1>
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 100,
            backgroundColor: 'rgba(21,128,61,0.1)',
            color: GREEN,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Active
        </span>
      </div>

      {/* Lease details */}
      <div
        style={{
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 12,
          padding: '24px',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 16,
              fontWeight: 500,
              color: INK,
              margin: 0,
            }}
          >
            {LEASE.property}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 13,
              color: DIM,
              margin: '4px 0 0',
            }}
          >
            Unit {LEASE.unit} &middot; {LEASE.city}
          </p>
        </div>

        <DetailRow label="Lease term" value={`${fmtDate(LEASE.startDate)} - ${fmtDate(LEASE.endDate)}`} />
        <DetailRow label="Monthly rent" value={fmtMoney(LEASE.monthlyRent)} />
        <DetailRow label="Security deposit" value={fmtMoney(LEASE.securityDeposit)} />
        <DetailRow
          label="Late fee"
          value={`${fmtMoney(LEASE.lateFeeAmount)} after ${LEASE.lateFeeGrace}-day grace period`}
        />
        <DetailRow label="Tenants" value={LEASE.tenants.join(', ')} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0 0',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 13,
              color: DIM,
            }}
          >
            E-signature
          </span>
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 100,
              backgroundColor: 'rgba(21,128,61,0.1)',
              color: GREEN,
            }}
          >
            Signed
          </span>
        </div>
      </div>

      {/* Documents */}
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            fontWeight: 600,
            color: INK,
            margin: '0 0 16px',
          }}
        >
          Documents
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {DOCUMENTS.map((doc, i) => (
            <motion.div
              key={doc.id}
              whileHover={{ backgroundColor: CREAM }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: i < DOCUMENTS.length - 1 ? `1px solid ${HAIRLINE}` : 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: CREAM,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={DIM} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: 13,
                      fontWeight: 500,
                      color: INK,
                      margin: 0,
                    }}
                  >
                    {doc.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: 11,
                      color: DIM,
                      margin: '2px 0 0',
                    }}
                  >
                    {doc.type} &middot; {doc.size} &middot; {fmtShortDate(doc.date)}
                  </p>
                </div>
              </div>
              <motion.span
                whileHover={{ opacity: 0.7 }}
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 12,
                  color: DIM,
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                Download
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
