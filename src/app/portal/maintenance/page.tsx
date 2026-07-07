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

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type RequestStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved';

type MaintenanceRequest = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
};

const STATUSES: RequestStatus[] = ['submitted', 'assigned', 'in_progress', 'resolved'];
const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const PRIORITY_STYLES: Record<Priority, { bg: string; color: string }> = {
  low: { bg: 'rgba(17,17,17,0.06)', color: DIM },
  medium: { bg: 'rgba(249,217,106,0.25)', color: '#92700C' },
  high: { bg: 'rgba(185,28,28,0.1)', color: '#B91C1C' },
  urgent: { bg: 'rgba(185,28,28,0.18)', color: '#B91C1C' },
};

const MOCK_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'mr1',
    title: 'HVAC filter replacement',
    description: 'The air conditioning filter needs to be replaced. Air quality has decreased noticeably.',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-05-15',
    updatedAt: '2026-05-18',
  },
  {
    id: 'mr2',
    title: 'Leaking kitchen faucet',
    description: 'The kitchen faucet has a slow drip that has gotten worse over the past week.',
    priority: 'high',
    status: 'assigned',
    createdAt: '2026-06-02',
    updatedAt: '2026-06-03',
  },
  {
    id: 'mr3',
    title: 'Dishwasher not draining',
    description: 'Dishwasher leaves standing water at the bottom after each cycle. Tried running a clean cycle with no improvement.',
    priority: 'high',
    status: 'resolved',
    createdAt: '2026-04-20',
    updatedAt: '2026-05-28',
  },
];

const fmtDate = (s: string) => {
  const d = new Date(s + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function StatusTimeline({ currentStatus }: { currentStatus: RequestStatus }) {
  const currentIndex = STATUSES.indexOf(currentStatus);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 12 }}>
      {STATUSES.map((status, i) => {
        const isCompleted = i <= currentIndex;
        const isLast = i === STATUSES.length - 1;
        return (
          <div key={status} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: isCompleted ? (status === 'resolved' ? GREEN : INK) : 'rgba(17,17,17,0.12)',
                  transition: 'background-color 0.2s',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 9,
                  color: isCompleted ? MID : DIM,
                  fontWeight: isCompleted ? 500 : 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: i < currentIndex ? INK : 'rgba(17,17,17,0.12)',
                  margin: '0 4px',
                  marginBottom: 20,
                  transition: 'background-color 0.2s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MaintenancePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
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
        Maintenance
      </h1>

      {/* Submit form */}
      <div
        style={{
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 12,
          padding: '24px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 14,
            fontWeight: 600,
            color: INK,
            margin: '0 0 20px',
          }}
        >
          Submit a Request
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 12,
                fontWeight: 500,
                color: MID,
                display: 'block',
                marginBottom: 6,
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 8,
                fontFamily: 'var(--font-inter)',
                fontSize: 14,
                color: INK,
                outline: 'none',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 12,
                fontWeight: 500,
                color: MID,
                display: 'block',
                marginBottom: 6,
              }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the issue, location, and any relevant context"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 8,
                fontFamily: 'var(--font-inter)',
                fontSize: 14,
                color: INK,
                outline: 'none',
                resize: 'vertical',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: MID,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 8,
                  fontFamily: 'var(--font-inter)',
                  fontSize: 14,
                  color: INK,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  appearance: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: 12,
                  fontWeight: 500,
                  color: MID,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                Photo
              </label>
              <div
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px dashed rgba(17,17,17,0.15)`,
                  borderRadius: 8,
                  fontFamily: 'var(--font-inter)',
                  fontSize: 13,
                  color: DIM,
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                Upload photo
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            style={{
              padding: '12px 0',
              backgroundColor: submitted ? GREEN : INK,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'var(--font-inter)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {submitted ? 'Submitted!' : 'Submit Request'}
          </motion.button>
        </form>
      </div>

      {/* Active requests */}
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
          Your Requests
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {MOCK_REQUESTS.map((req) => {
            const priorityStyle = PRIORITY_STYLES[req.priority];
            return (
              <motion.div
                key={req.id}
                whileHover={{ borderColor: 'rgba(17,17,17,0.15)' }}
                style={{
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 12,
                  padding: '20px 24px',
                  cursor: 'default',
                  transition: 'border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
                      {req.title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize: 12,
                        color: DIM,
                        margin: '4px 0 0',
                        lineHeight: 1.5,
                      }}
                    >
                      {req.description}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 100,
                      backgroundColor: priorityStyle.bg,
                      color: priorityStyle.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      flexShrink: 0,
                      marginLeft: 12,
                    }}
                  >
                    {req.priority}
                  </span>
                </div>

                <StatusTimeline currentStatus={req.status} />

                <p
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: 11,
                    color: DIM,
                    margin: '12px 0 0',
                  }}
                >
                  Submitted {fmtDate(req.createdAt)} &middot; Updated {fmtDate(req.updatedAt)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
