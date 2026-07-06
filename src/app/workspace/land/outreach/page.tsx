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

type OutreachType = 'letter' | 'call' | 'email' | 'door-knock' | 'sms';
type ResponseType = 'no-response' | 'interested' | 'not-interested' | 'call-back' | 'do-not-contact';

type OutreachEntry = {
  id: string;
  date: string;
  type: OutreachType;
  response: ResponseType;
  notes: string;
};

type ParcelOwner = {
  id: string;
  apn: string;
  address: string;
  owner: string;
  outreachCount: number;
  lastContact: string;
  outreachLog: OutreachEntry[];
};

const MOCK_PARCELS: ParcelOwner[] = [
  {
    id: 'o1',
    apn: '445-210-18',
    address: '1892 Rosecrans St',
    owner: 'Pacific Vista LLC',
    outreachCount: 4,
    lastContact: '2026-03-28',
    outreachLog: [
      { id: 'e1', date: '2026-03-28', type: 'call', response: 'call-back', notes: 'Spoke with property manager. Owner traveling until April 15. Will call back.' },
      { id: 'e2', date: '2026-03-15', type: 'letter', response: 'no-response', notes: 'Sent handwritten letter with offer range. No reply yet.' },
      { id: 'e3', date: '2026-02-20', type: 'email', response: 'no-response', notes: 'Initial outreach email to registered agent.' },
      { id: 'e4', date: '2026-02-01', type: 'door-knock', response: 'not-interested', notes: 'Property manager on-site said owner not selling. Left card.' },
    ],
  },
  {
    id: 'o2',
    apn: '218-370-11',
    address: '3310 Fairmount Ave',
    owner: 'James & Margaret Noll',
    outreachCount: 3,
    lastContact: '2026-04-02',
    outreachLog: [
      { id: 'e5', date: '2026-04-02', type: 'call', response: 'interested', notes: 'James answered. Interested in selling but wants $350K minimum. Tax liens are a concern for him.' },
      { id: 'e6', date: '2026-03-20', type: 'letter', response: 'no-response', notes: 'Yellow letter campaign batch #3.' },
      { id: 'e7', date: '2026-03-01', type: 'sms', response: 'no-response', notes: 'Initial SMS drip. No opt-out.' },
    ],
  },
  {
    id: 'o3',
    apn: '338-060-22',
    address: '2945 Imperial Ave',
    owner: 'SE Community Partners',
    outreachCount: 2,
    lastContact: '2026-03-10',
    outreachLog: [
      { id: 'e8', date: '2026-03-10', type: 'email', response: 'call-back', notes: 'Board member responded. Need to present offer to full board at April meeting.' },
      { id: 'e9', date: '2026-02-15', type: 'letter', response: 'no-response', notes: 'Formal LOI sent via certified mail.' },
    ],
  },
  {
    id: 'o4',
    apn: '774-192-07',
    address: '855 W Washington St',
    owner: 'Martha J. Solis',
    outreachCount: 5,
    lastContact: '2026-04-05',
    outreachLog: [
      { id: 'e10', date: '2026-04-05', type: 'call', response: 'interested', notes: 'Martha is elderly, interested in selling but wants to stay through August. Possible leaseback arrangement.' },
      { id: 'e11', date: '2026-03-25', type: 'door-knock', response: 'call-back', notes: 'Met Martha at the door. Very friendly. Gave her my card. She said her son handles finances.' },
      { id: 'e12', date: '2026-03-12', type: 'letter', response: 'no-response', notes: 'Second handwritten letter.' },
      { id: 'e13', date: '2026-02-28', type: 'letter', response: 'no-response', notes: 'First handwritten letter with neighborhood comp data.' },
      { id: 'e14', date: '2026-02-10', type: 'sms', response: 'no-response', notes: 'Initial SMS. No response.' },
    ],
  },
  {
    id: 'o5',
    apn: '412-285-14',
    address: '6230 Lake Murray Blvd',
    owner: 'Brennan Family LP',
    outreachCount: 1,
    lastContact: '2026-03-30',
    outreachLog: [
      { id: 'e15', date: '2026-03-30', type: 'email', response: 'do-not-contact', notes: 'Attorney responded: client not interested, do not contact again.' },
    ],
  },
];

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const responseColors: Record<ResponseType, { bg: string; text: string; border: string }> = {
  'no-response':     { bg: '#F5F5F4', text: MID, border: HAIRLINE },
  'interested':      { bg: '#F0FDF4', text: GREEN, border: '#BBF7D0' },
  'not-interested':  { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  'call-back':       { bg: '#FEF9E1', text: '#92400E', border: BUTTER },
  'do-not-contact':  { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
};

const responseLabels: Record<ResponseType, string> = {
  'no-response': 'No Response',
  'interested': 'Interested',
  'not-interested': 'Not Interested',
  'call-back': 'Call Back',
  'do-not-contact': 'Do Not Contact',
};

const typeLabels: Record<OutreachType, string> = {
  letter: 'Letter',
  call: 'Call',
  email: 'Email',
  'door-knock': 'Door Knock',
  sms: 'SMS',
};

export default function OwnerOutreachPage() {
  const [selectedId, setSelectedId] = useState<string | null>('o1');
  const [parcels, setParcels] = useState(MOCK_PARCELS);

  // Log form state
  const [logDate, setLogDate] = useState('2026-04-09');
  const [logType, setLogType] = useState<OutreachType>('call');
  const [logResponse, setLogResponse] = useState<ResponseType>('no-response');
  const [logNotes, setLogNotes] = useState('');

  const selected = parcels.find((p) => p.id === selectedId) ?? null;

  const handleLogSubmit = () => {
    if (!selected || !logNotes.trim()) return;
    const newEntry: OutreachEntry = {
      id: `e${Date.now()}`,
      date: logDate,
      type: logType,
      response: logResponse,
      notes: logNotes,
    };
    setParcels((prev) =>
      prev.map((p) =>
        p.id === selected.id
          ? { ...p, outreachLog: [newEntry, ...p.outreachLog], outreachCount: p.outreachCount + 1, lastContact: logDate }
          : p,
      ),
    );
    setLogNotes('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Land . Outreach</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Owner <em className="italic">Outreach</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Track every touchpoint with parcel owners. Log calls, letters, and door knocks. Build relationships that close deals.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: parcel list */}
          <div className="lg:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
              {parcels.length} parcels in outreach
            </div>
            <div className="space-y-2">
              {parcels.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedId(p.id)}
                  className="w-full rounded-lg border bg-white p-4 text-left transition-colors"
                  style={{ borderColor: selectedId === p.id ? BUTTER : HAIRLINE }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm" style={{ color: INK }}>{p.owner}</div>
                      <div className="text-xs mt-0.5" style={{ color: DIM }}>{p.address}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{p.apn}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs" style={{ color: MID }}>
                        <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{p.outreachCount}</span> touches
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: DIM }}>
                        Last: {fmtDate(p.lastContact)}
                      </div>
                    </div>
                  </div>
                  {/* Latest response badge */}
                  {p.outreachLog[0] && (
                    <div className="mt-2">
                      <span
                        className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: responseColors[p.outreachLog[0].response].bg,
                          color: responseColors[p.outreachLog[0].response].text,
                          borderColor: responseColors[p.outreachLog[0].response].border,
                        }}
                      >
                        {responseLabels[p.outreachLog[0].response]}
                      </span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="space-y-6">
                {/* Owner header */}
                <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Owner</div>
                      <h3 className="text-2xl mt-1" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{selected.owner}</h3>
                      <div className="text-sm mt-1" style={{ color: MID }}>{selected.address} / {selected.apn}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl tabular-nums" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{selected.outreachCount}</div>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Touches</div>
                    </div>
                  </div>
                </div>

                {/* Outreach log */}
                <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
                  <div className="text-[10px] uppercase tracking-[0.16em] mb-4" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Outreach Log</div>
                  <div className="space-y-3">
                    {selected.outreachLog.map((entry) => (
                      <div key={entry.id} className="rounded-md border p-3" style={{ borderColor: HAIRLINE }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium" style={{ color: INK }}>{typeLabels[entry.type]}</span>
                            <span className="text-[11px]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{fmtDate(entry.date)}</span>
                          </div>
                          <span
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: responseColors[entry.response].bg,
                              color: responseColors[entry.response].text,
                              borderColor: responseColors[entry.response].border,
                            }}
                          >
                            {responseLabels[entry.response]}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: MID }}>{entry.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Letter preview */}
                <div className="rounded-lg border p-6" style={{ borderColor: BUTTER, backgroundColor: '#FEF9E1' }}>
                  <div className="text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Letter Template Preview</div>
                  <div className="rounded-md border bg-white p-5" style={{ borderColor: HAIRLINE }}>
                    <div className="space-y-3 text-sm leading-relaxed" style={{ color: INK, fontFamily: 'var(--font-inter)' }}>
                      <p style={{ color: DIM, fontFamily: 'var(--font-geist-mono)', fontSize: '11px' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p>Dear <strong>{selected.owner}</strong>,</p>
                      <p>
                        I am writing to express my interest in purchasing your property located at{' '}
                        <strong>{selected.address}</strong> (APN: {selected.apn}). I am a local real estate investor
                        focused on the San Diego market, and your parcel aligns with what I am looking for.
                      </p>
                      <p>
                        I understand that selling a property is a significant decision. I want you to know that I can offer
                        a fair price, flexible closing timeline, and a smooth transaction with no contingencies. I buy
                        properties in any condition.
                      </p>
                      <p>
                        If you have any interest in exploring this further, I would welcome a brief conversation at your
                        convenience. There is no obligation, and I respect your time.
                      </p>
                      <p>Warm regards,</p>
                      <p className="font-medium">CASA Acquisitions Team</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-md px-4 py-2 text-xs font-medium"
                      style={{ backgroundColor: INK, color: CREAM }}
                    >
                      Generate & Send
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-md border px-4 py-2 text-xs font-medium"
                      style={{ borderColor: INK, color: INK }}
                    >
                      Customize
                    </motion.button>
                  </div>
                </div>

                {/* Log outreach form */}
                <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
                  <div className="text-[10px] uppercase tracking-[0.16em] mb-4" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Log Outreach</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Date</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                        style={{ borderColor: HAIRLINE, fontFamily: 'var(--font-geist-mono)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Type</label>
                      <select
                        value={logType}
                        onChange={(e) => setLogType(e.target.value as OutreachType)}
                        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                        style={{ borderColor: HAIRLINE }}
                      >
                        <option value="call">Call</option>
                        <option value="letter">Letter</option>
                        <option value="email">Email</option>
                        <option value="door-knock">Door Knock</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Response</label>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(responseLabels) as ResponseType[]).map((r) => (
                          <motion.button
                            key={r}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setLogResponse(r)}
                            className="rounded-full border px-3 py-1 text-[11px] font-medium"
                            style={{
                              borderColor: logResponse === r ? INK : HAIRLINE,
                              backgroundColor: logResponse === r ? responseColors[r].bg : 'white',
                              color: logResponse === r ? responseColors[r].text : MID,
                            }}
                          >
                            {responseLabels[r]}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Notes</label>
                      <textarea
                        value={logNotes}
                        onChange={(e) => setLogNotes(e.target.value)}
                        rows={3}
                        placeholder="What happened? Key details, next steps..."
                        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none resize-none"
                        style={{ borderColor: HAIRLINE }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLogSubmit}
                      className="rounded-md px-5 py-2.5 text-xs font-medium"
                      style={{ backgroundColor: BUTTER, color: INK }}
                    >
                      Log Outreach
                    </motion.button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border bg-white p-16" style={{ borderColor: HAIRLINE }}>
                <p className="text-sm italic" style={{ fontFamily: 'var(--font-heading)', color: DIM }}>Select a parcel to view outreach details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
