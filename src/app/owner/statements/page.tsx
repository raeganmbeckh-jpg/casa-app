"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, FileSpreadsheet, ChevronDown } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   TOKENS
   ═══════════════════════════════════════════════════════════════════ */

const INK = "#111111";
const CREAM = "#FAFAF7";
const HAIRLINE = "rgba(17,17,17,0.08)";
const BUTTER = "#F9D96A";
const DIM = "rgba(17,17,17,0.45)";
const MID = "rgba(17,17,17,0.65)";
const GREEN = "#15803D";
const RED = "#B91C1C";

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════ */

const PROPERTIES = [
  { id: "prop-1", address: "2167 Villa Sonoma Glen" },
  { id: "prop-2", address: "814 Crescent Park Dr" },
  { id: "prop-3", address: "305 Magnolia Ct" },
];

const MONTHS = [
  "2026-01", "2026-02", "2026-03",
  "2025-10", "2025-11", "2025-12",
];

interface LineItem {
  label: string;
  amount: number;
}

interface StatementData {
  income: LineItem[];
  expenses: LineItem[];
}

function generateStatement(propertyId: string, month: string): StatementData {
  // Deterministic mock based on property + month
  const seed = (propertyId.charCodeAt(5) || 1) * (parseInt(month.replace("-", "")) % 97);
  const base = propertyId === "prop-1" ? 3200 : propertyId === "prop-2" ? 2750 : 1950;
  const parking = (seed % 3 === 0) ? 150 : 0;
  const lateFee = (seed % 7 === 0) ? 75 : 0;

  return {
    income: [
      { label: "Rent", amount: base },
      ...(parking ? [{ label: "Parking", amount: parking }] : []),
      ...(lateFee ? [{ label: "Late fee", amount: lateFee }] : []),
    ],
    expenses: [
      { label: "Mortgage", amount: Math.round(base * 0.52) },
      { label: "Insurance", amount: Math.round(base * 0.06) },
      { label: "Property taxes", amount: Math.round(base * 0.14) },
      { label: "Maintenance", amount: Math.round(80 + (seed % 200)) },
      { label: "Management fee (8%)", amount: Math.round(base * 0.08) },
    ],
  };
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const monthLabel = (m: string) => {
  const [y, mo] = m.split("-");
  const d = new Date(parseInt(y), parseInt(mo) - 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          color: INK,
          background: "#FFFFFF",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 8,
          padding: "10px 36px 10px 14px",
          cursor: "pointer",
          minWidth: 200,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        color={DIM}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      />
    </div>
  );
}

function TooltipButton({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onClick={() => setShowTip(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-inter)",
          fontSize: 13,
          fontWeight: 500,
          color: MID,
          background: "#FFFFFF",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 8,
          padding: "8px 16px",
          cursor: "pointer",
        }}
      >
        <Icon size={14} />
        {label}
      </button>
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: INK,
              color: "#FFFFFF",
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              padding: "6px 12px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            Coming soon
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function StatementsPage() {
  const [propertyId, setPropertyId] = useState(PROPERTIES[0].id);
  const [month, setMonth] = useState(MONTHS[0]);

  const statement = generateStatement(propertyId, month);
  const totalIncome = statement.income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = statement.expenses.reduce((s, i) => s + i.amount, 0);
  const netToOwner = totalIncome - totalExpenses;

  // YTD summary
  const ytdRows = MONTHS.map((m) => {
    const s = generateStatement(propertyId, m);
    const inc = s.income.reduce((a, i) => a + i.amount, 0);
    const exp = s.expenses.reduce((a, i) => a + i.amount, 0);
    return { month: m, income: inc, expenses: exp, net: inc - exp };
  });
  const ytdTotalIncome = ytdRows.reduce((s, r) => s + r.income, 0);
  const ytdTotalExpenses = ytdRows.reduce((s, r) => s + r.expenses, 0);
  const ytdNet = ytdTotalIncome - ytdTotalExpenses;

  return (
    <>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 24 }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 32,
            fontWeight: 600,
            color: INK,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Monthly Statements
        </h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: DIM, marginTop: 6 }}>
          Itemized income and expense breakdown per property
        </p>
      </motion.div>

      {/* Selectors */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <Select
          value={propertyId}
          onChange={setPropertyId}
          options={PROPERTIES.map((p) => ({ value: p.id, label: p.address }))}
        />
        <Select
          value={month}
          onChange={setMonth}
          options={MONTHS.map((m) => ({ value: m, label: monthLabel(m) }))}
        />
      </div>

      {/* Statement card */}
      <motion.div
        key={`${propertyId}-${month}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          border: `1px solid ${HAIRLINE}`,
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        {/* Statement header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${HAIRLINE}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 600,
                color: INK,
                margin: 0,
              }}
            >
              {PROPERTIES.find((p) => p.id === propertyId)?.address}
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: DIM, margin: "4px 0 0" }}>
              {monthLabel(month)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <TooltipButton icon={FileDown} label="Download PDF" />
            <TooltipButton icon={FileSpreadsheet} label="Export CSV" />
          </div>
        </div>

        {/* Income */}
        <div style={{ padding: "16px 24px 8px" }}>
          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: DIM,
              margin: "0 0 12px",
            }}
          >
            Income
          </h3>
          {statement.income.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${HAIRLINE}`,
              }}
            >
              <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: INK }}>
                {item.label}
              </span>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, color: INK }}>
                {fmt(item.amount)}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: 600, color: INK }}>
              Total Income
            </span>
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, fontWeight: 600, color: INK }}>
              {fmt(totalIncome)}
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div style={{ padding: "8px 24px" }}>
          <h3
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: DIM,
              margin: "0 0 12px",
            }}
          >
            Expenses
          </h3>
          {statement.expenses.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${HAIRLINE}`,
              }}
            >
              <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: INK }}>
                {item.label}
              </span>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, color: RED }}>
                {fmt(item.amount)}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: 600, color: INK }}>
              Total Expenses
            </span>
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, fontWeight: 600, color: RED }}>
              {fmt(totalExpenses)}
            </span>
          </div>
        </div>

        {/* Net to owner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            background: CREAM,
            borderTop: `1px solid ${HAIRLINE}`,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 18,
              fontWeight: 600,
              color: INK,
            }}
          >
            Net to Owner
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 22,
              fontWeight: 600,
              color: netToOwner >= 0 ? GREEN : RED,
            }}
          >
            {fmt(netToOwner)}
          </span>
        </div>
      </motion.div>

      {/* YTD Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          border: `1px solid ${HAIRLINE}`,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${HAIRLINE}` }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 18,
              fontWeight: 600,
              color: INK,
              margin: 0,
            }}
          >
            YTD Summary
          </h2>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-inter)",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                {["Month", "Income", "Expenses", "Net"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: h === "Month" ? "left" : "right",
                      padding: "10px 16px",
                      fontWeight: 600,
                      color: DIM,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ytdRows.map((row) => (
                <tr key={row.month} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  <td style={{ padding: "10px 16px", color: INK }}>{monthLabel(row.month)}</td>
                  <td
                    style={{
                      padding: "10px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-geist-mono)",
                      color: INK,
                    }}
                  >
                    {fmt(row.income)}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-geist-mono)",
                      color: RED,
                    }}
                  >
                    {fmt(row.expenses)}
                  </td>
                  <td
                    style={{
                      padding: "10px 16px",
                      textAlign: "right",
                      fontFamily: "var(--font-geist-mono)",
                      fontWeight: 500,
                      color: row.net >= 0 ? GREEN : RED,
                    }}
                  >
                    {fmt(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: CREAM }}>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: INK }}>Total</td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontFamily: "var(--font-geist-mono)",
                    fontWeight: 600,
                    color: INK,
                  }}
                >
                  {fmt(ytdTotalIncome)}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontFamily: "var(--font-geist-mono)",
                    fontWeight: 600,
                    color: RED,
                  }}
                >
                  {fmt(ytdTotalExpenses)}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    fontFamily: "var(--font-geist-mono)",
                    fontWeight: 600,
                    color: ytdNet >= 0 ? GREEN : RED,
                  }}
                >
                  {fmt(ytdNet)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </>
  );
}
