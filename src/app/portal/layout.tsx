'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const DIM = 'rgba(17,17,17,0.45)';

const NAV_ITEMS = [
  { label: 'Home', href: '/portal', icon: HomeIcon },
  { label: 'Payments', href: '/portal/payments', icon: PaymentsIcon },
  { label: 'Maintenance', href: '/portal/maintenance', icon: MaintenanceIcon },
  { label: 'Lease', href: '/portal/lease', icon: LeaseIcon },
  { label: 'Messages', href: '/portal/messages', icon: MessagesIcon },
];

function HomeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PaymentsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function MaintenanceIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function LeaseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function MessagesIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Top bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/portal" style={{ textDecoration: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 22,
                fontWeight: 600,
                color: INK,
                letterSpacing: '-0.02em',
              }}
            >
              CASA
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 13,
                color: DIM,
              }}
            >
              Maya Hernandez
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
                padding: '4px 0',
              }}
            >
              Sign out
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 120px' }}>
        {children}
      </main>

      {/* Bottom tab nav */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          borderTop: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0 env(safe-area-inset-bottom, 8px)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: 'none' }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    color: isActive ? INK : DIM,
                  }}
                >
                  <Icon size={20} />
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: 10,
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
