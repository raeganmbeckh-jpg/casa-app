'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
type Role = 'owner' | 'manager' | 'staff';
type MemberStatus = 'active' | 'invited';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  properties: string[];
  lastActive: string;
  status: MemberStatus;
};

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_MEMBERS: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Raegan Beckham',
    email: 'raegan@casa.app',
    role: 'owner',
    properties: ['Villa Sonoma', 'Mission Bay Lofts', 'North Park Row'],
    lastActive: '2026-04-09',
    status: 'active',
  },
  {
    id: 'tm2',
    name: 'Sarah Chen',
    email: 'sarah.chen@casa.app',
    role: 'manager',
    properties: ['Villa Sonoma', 'North Park Row'],
    lastActive: '2026-04-09',
    status: 'active',
  },
  {
    id: 'tm3',
    name: 'Mike Torres',
    email: 'mike.torres@casa.app',
    role: 'manager',
    properties: ['Mission Bay Lofts'],
    lastActive: '2026-04-08',
    status: 'active',
  },
  {
    id: 'tm4',
    name: 'Jasmine Patel',
    email: 'jasmine.p@casa.app',
    role: 'staff',
    properties: ['Villa Sonoma', 'Mission Bay Lofts'],
    lastActive: '2026-04-07',
    status: 'active',
  },
  {
    id: 'tm5',
    name: 'Derek Nguyen',
    email: 'derek.n@example.com',
    role: 'staff',
    properties: ['North Park Row'],
    lastActive: '',
    status: 'invited',
  },
];

const ALL_PROPERTIES = ['Villa Sonoma', 'Mission Bay Lofts', 'North Park Row'];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtDate = (iso: string) => {
  if (!iso) return '--';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const roleConfig: Record<Role, { label: string; cls: string }> = {
  owner:   { label: 'Owner',   cls: 'bg-purple-50 text-purple-800 border-purple-200' },
  manager: { label: 'Manager', cls: 'bg-blue-50 text-blue-800 border-blue-200' },
  staff:   { label: 'Staff',   cls: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
};

const statusConfig: Record<MemberStatus, { label: string; color: string }> = {
  active:  { label: 'Active',  color: GREEN },
  invited: { label: 'Invited', color: BUTTER },
};

/* ── KPIs ──────────────────────────────────────────────────── */
const teamSize = MOCK_MEMBERS.length;
const activeToday = MOCK_MEMBERS.filter((m) => m.lastActive === '2026-04-09').length;
const pendingInvites = MOCK_MEMBERS.filter((m) => m.status === 'invited').length;
const totalPropertyAssignments = MOCK_MEMBERS.reduce((s, m) => s + m.properties.length, 0);
const propertiesPerPerson = (totalPropertyAssignments / teamSize).toFixed(1);

/* ── Page ──────────────────────────────────────────────────── */
export default function TeamPage() {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff' as Role,
    properties: [] as string[],
  });

  const toggleProperty = (prop: string) => {
    setInviteForm((prev) => ({
      ...prev,
      properties: prev.properties.includes(prop)
        ? prev.properties.filter((p) => p !== prop)
        : [...prev.properties, prop],
    }));
  };

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: INK, margin: 0 }}>
            Team
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: DIM, marginTop: 4 }}>
            Manage team members, roles, and property access
          </p>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 28 }}>
          {[
            { label: 'Team size', value: String(teamSize) },
            { label: 'Active today', value: String(activeToday) },
            { label: 'Pending invites', value: String(pendingInvites) },
            { label: 'Properties/person avg', value: propertiesPerPerson },
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

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
          >
            {showInviteForm ? 'Cancel' : 'Invite Member'}
          </button>
        </div>

        {/* Invite Form */}
        <AnimatePresence>
          {showInviteForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: 24, marginTop: 16, overflow: 'hidden' }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: INK, margin: '0 0 16px' }}>
                Invite Team Member
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Email</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="name@example.com"
                    style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', color: INK, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as Role })}
                    style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', background: '#fff', color: INK, outline: 'none' }}
                  >
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 8 }}>Property Access</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {ALL_PROPERTIES.map((prop) => {
                    const selected = inviteForm.properties.includes(prop);
                    return (
                      <button
                        key={prop}
                        onClick={() => toggleProperty(prop)}
                        style={{
                          fontFamily: 'var(--font-inter)',
                          fontSize: 12,
                          padding: '6px 14px',
                          borderRadius: 8,
                          border: `1px solid ${selected ? INK : HAIRLINE}`,
                          background: selected ? INK : '#fff',
                          color: selected ? CREAM : MID,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {prop}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                style={{ marginTop: 20, fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer' }}
              >
                Send Invite
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team Member Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16, marginTop: 20 }}>
          {MOCK_MEMBERS.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: INK, margin: 0 }}>
                    {member.name}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: DIM, marginTop: 2 }}>
                    {member.email}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={roleConfig[member.role].cls} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid', display: 'inline-block' }}>
                    {roleConfig[member.role].label}
                  </span>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: statusConfig[member.status].color,
                    display: 'inline-block',
                  }} title={statusConfig[member.status].label} />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: DIM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Properties assigned
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {member.properties.map((p) => (
                    <span key={p} style={{ fontFamily: 'var(--font-inter)', fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(17,17,17,0.04)', color: MID }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${HAIRLINE}` }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: DIM, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Last active
                  </span>
                  <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: MID, margin: '2px 0 0' }}>
                    {fmtDate(member.lastActive)}
                  </p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: member.status === 'active' ? 'rgba(21,128,61,0.08)' : 'rgba(249,217,106,0.2)',
                  color: statusConfig[member.status].color,
                  fontWeight: 500,
                }}>
                  {statusConfig[member.status].label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
