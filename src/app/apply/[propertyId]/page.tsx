'use client';

import { useState } from 'react';
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

/* ── Mock property data ───────────────────────────────────── */
const MOCK_PROPERTIES: Record<string, { address: string; unit: string; rent: number; beds: number; baths: number; sqft: number }> = {
  'villa-sonoma-a204':    { address: '1847 Villa Sonoma Dr', unit: 'A-204', rent: 2850, beds: 2, baths: 2, sqft: 1150 },
  'villa-sonoma-b112':    { address: '1847 Villa Sonoma Dr', unit: 'B-112', rent: 3100, beds: 2, baths: 2, sqft: 1280 },
  'mission-bay-c301':     { address: '520 Mission Bay Blvd', unit: 'C-301', rent: 3650, beds: 3, baths: 2, sqft: 1420 },
  'north-park-d105':      { address: '3012 North Park Way',  unit: 'D-105', rent: 2400, beds: 1, baths: 1, sqft: 820 },
  'north-park-e208':      { address: '3012 North Park Way',  unit: 'E-208', rent: 2600, beds: 2, baths: 1, sqft: 980 },
  'mission-bay-f410':     { address: '520 Mission Bay Blvd', unit: 'F-410', rent: 3950, beds: 3, baths: 2, sqft: 1560 },
};

const DEFAULT_PROPERTY = { address: '1847 Villa Sonoma Dr', unit: 'A-204', rent: 2850, beds: 2, baths: 2, sqft: 1150 };

type Reference = { name: string; phone: string; relationship: string };

export default function ApplyPage({ params }: { params: { propertyId: string } }) {
  const property = MOCK_PROPERTIES[params.propertyId] || DEFAULT_PROPERTY;

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentAddress: '',
    employer: '',
    monthlyIncome: '',
    moveInDate: '',
  });
  const [references, setReferences] = useState<[Reference, Reference]>([
    { name: '', phone: '', relationship: '' },
    { name: '', phone: '', relationship: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateRef(index: 0 | 1, field: keyof Reference, value: string) {
    setReferences((prev) => {
      const next = [...prev] as [Reference, Reference];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // basic validation
    if (!form.fullName || !form.email || !form.phone || !form.currentAddress || !form.employer || !form.monthlyIncome || !form.moveInDate) {
      setError('Please fill out all required fields.');
      return;
    }
    if (!references[0].name || !references[0].phone || !references[0].relationship) {
      setError('Please provide at least 2 complete references.');
      return;
    }
    if (!references[1].name || !references[1].phone || !references[1].relationship) {
      setError('Please provide at least 2 complete references.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: params.propertyId,
          propertyAddress: property.address,
          unit: property.unit,
          rent: property.rent,
          ...form,
          monthlyIncome: parseFloat(form.monthlyIncome),
          references,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-inter)',
    fontSize: 14,
    color: INK,
    backgroundColor: '#fff',
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 10,
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-inter)',
    fontSize: 13,
    fontWeight: 500,
    color: MID,
    marginBottom: 6,
    display: 'block',
  };

  /* ── Success state ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <main style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${GREEN}18` }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1
              className="text-3xl mb-4"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}
            >
              Application submitted!
            </h1>
            <p className="text-base leading-relaxed mb-2" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
              We&apos;ll be in touch within 48 hours.
            </p>
            <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: DIM }}>
              {property.address} &middot; Unit {property.unit}
            </p>
          </motion.div>
        </div>
      </main>
    );
  }

  /* ── Form ───────────────────────────────────────────────────── */
  return (
    <main style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className="border-b"
        style={{ borderColor: HAIRLINE, backgroundColor: '#fff' }}
      >
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: INK }}>
            CASA
          </span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 12, color: DIM, letterSpacing: '0.04em' }}>
            Rental Application
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* ── Property card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border p-6 mb-8"
          style={{ borderColor: HAIRLINE, backgroundColor: '#fff' }}
        >
          <p className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-inter)', color: DIM, fontWeight: 600 }}>
            Applying for
          </p>
          <h2
            className="text-2xl mb-1"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}
          >
            {property.address}
          </h2>
          <div className="flex flex-wrap gap-4 mt-3">
            <span className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
              Unit {property.unit}
            </span>
            <span className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
              {property.beds} bed / {property.baths} bath
            </span>
            <span className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
              {property.sqft.toLocaleString()} sqft
            </span>
            <span
              className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}
            >
              ${property.rent.toLocaleString()}/mo
            </span>
          </div>
        </motion.div>

        {/* ── Form card ────────────────────────────────────── */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border p-6 md:p-8"
          style={{ borderColor: HAIRLINE, backgroundColor: '#fff' }}
        >
          <h3
            className="text-lg mb-6"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}
          >
            Applicant Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                style={inputStyle}
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="Jane Smith"
                onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
              />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                style={inputStyle}
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="jane@email.com"
                onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone *</label>
              <input
                type="tel"
                style={inputStyle}
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="(555) 123-4567"
                onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
              />
            </div>
            <div>
              <label style={labelStyle}>Current Address *</label>
              <input
                style={inputStyle}
                value={form.currentAddress}
                onChange={(e) => updateField('currentAddress', e.target.value)}
                placeholder="123 Main St, San Diego, CA"
                onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
              />
            </div>
            <div>
              <label style={labelStyle}>Employer *</label>
              <input
                style={inputStyle}
                value={form.employer}
                onChange={(e) => updateField('employer', e.target.value)}
                placeholder="Acme Corp"
                onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
              />
            </div>
            <div>
              <label style={labelStyle}>Monthly Income *</label>
              <input
                type="number"
                style={inputStyle}
                value={form.monthlyIncome}
                onChange={(e) => updateField('monthlyIncome', e.target.value)}
                placeholder="6500"
                onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
              />
            </div>
            <div className="md:col-span-2">
              <label style={labelStyle}>Desired Move-in Date *</label>
              <input
                type="date"
                style={inputStyle}
                value={form.moveInDate}
                onChange={(e) => updateField('moveInDate', e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
              />
            </div>
          </div>

          {/* ── References ──────────────────────────────────── */}
          <div className="border-t pt-6 mb-6" style={{ borderColor: HAIRLINE }}>
            <h3
              className="text-lg mb-5"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}
            >
              References
            </h3>

            {([0, 1] as const).map((idx) => (
              <div key={idx} className="mb-5">
                <p className="text-xs uppercase tracking-widest mb-3" style={{ fontFamily: 'var(--font-inter)', color: DIM, fontWeight: 600 }}>
                  Reference {idx + 1}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input
                      style={inputStyle}
                      value={references[idx].name}
                      onChange={(e) => updateRef(idx, 'name', e.target.value)}
                      placeholder="John Doe"
                      onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone *</label>
                    <input
                      type="tel"
                      style={inputStyle}
                      value={references[idx].phone}
                      onChange={(e) => updateRef(idx, 'phone', e.target.value)}
                      placeholder="(555) 000-0000"
                      onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Relationship *</label>
                    <input
                      style={inputStyle}
                      value={references[idx].relationship}
                      onChange={(e) => updateRef(idx, 'relationship', e.target.value)}
                      placeholder="Former landlord"
                      onFocus={(e) => (e.target.style.borderColor = BUTTER)}
                      onBlur={(e) => (e.target.style.borderColor = HAIRLINE)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Fee notice ──────────────────────────────────── */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{ backgroundColor: `${BUTTER}14`, border: `1px solid ${BUTTER}40` }}
          >
            <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
              <span style={{ fontWeight: 600, color: INK }}>Application fee: $35.00</span>
              {' '}&mdash; A non-refundable application fee will be collected via Stripe upon submission to cover background and credit screening.
            </p>
          </div>

          {/* ── Error ──────────────────────────────────────── */}
          {error && (
            <div
              className="rounded-xl p-4 mb-6"
              style={{ backgroundColor: `${RED}0C`, border: `1px solid ${RED}25` }}
            >
              <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: RED }}>
                {error}
              </p>
            </div>
          )}

          {/* ── Submit ─────────────────────────────────────── */}
          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl text-sm font-semibold transition-colors"
            style={{
              fontFamily: 'var(--font-inter)',
              backgroundColor: submitting ? `${BUTTER}80` : BUTTER,
              color: INK,
              cursor: submitting ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Application & Pay $35'}
          </motion.button>

          <p className="text-center text-xs mt-4" style={{ fontFamily: 'var(--font-inter)', color: DIM }}>
            By submitting, you agree to CASA&apos;s terms of service and authorize a background check.
          </p>
        </motion.form>
      </div>
    </main>
  );
}
