"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  TrendingUp,
  CircleDot,
} from "lucide-react";

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

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  rent: number;
  occupied: boolean;
  tenantName: string | null;
  leaseEnd: string | null;
  ytdIncome: number;
  ytdExpenses: number;
}

const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    address: "2167 Villa Sonoma Glen",
    city: "Austin",
    state: "TX",
    rent: 3200,
    occupied: true,
    tenantName: "James & Emily Hart",
    leaseEnd: "2027-02-28",
    ytdIncome: 12800,
    ytdExpenses: 7640,
  },
  {
    id: "prop-2",
    address: "814 Crescent Park Dr",
    city: "Austin",
    state: "TX",
    rent: 2750,
    occupied: true,
    tenantName: "Diana Reyes",
    leaseEnd: "2026-11-30",
    ytdIncome: 11000,
    ytdExpenses: 6420,
  },
  {
    id: "prop-3",
    address: "305 Magnolia Ct",
    city: "Round Rock",
    state: "TX",
    rent: 1950,
    occupied: false,
    tenantName: null,
    leaseEnd: null,
    ytdIncome: 5850,
    ytdExpenses: 4110,
  },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function KpiCard({
  label,
  value,
  icon: Icon,
  delay,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "20px 24px",
        border: `1px solid ${HAIRLINE}`,
        flex: "1 1 0",
        minWidth: 180,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={16} color={DIM} />
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: DIM }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 28,
          fontWeight: 600,
          color: INK,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </motion.div>
  );
}

function PropertyCard({ property, index }: { property: Property; index: number }) {
  const net = property.ytdIncome - property.ytdExpenses;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        border: `1px solid ${HAIRLINE}`,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "24px 24px 20px" }}>
        {/* Address */}
        <h3
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 20,
            fontWeight: 600,
            color: INK,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {property.address}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            color: DIM,
            margin: "4px 0 16px",
          }}
        >
          {property.city}, {property.state}
        </p>

        {/* Occupancy + Rent */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              fontWeight: 500,
              color: property.occupied ? GREEN : RED,
              background: property.occupied ? "rgba(21,128,61,0.08)" : "rgba(185,28,28,0.08)",
              padding: "4px 10px",
              borderRadius: 100,
            }}
          >
            <CircleDot size={10} />
            {property.occupied ? "Occupied" : "Vacant"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 14,
              fontWeight: 500,
              color: INK,
            }}
          >
            {fmt(property.rent)}/mo
          </span>
        </div>

        {property.occupied && property.tenantName && (
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: MID, margin: "0 0 4px" }}>
            Tenant: {property.tenantName}
          </p>
        )}
        {property.occupied && property.leaseEnd && (
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: DIM, margin: 0 }}>
            Lease ends {new Date(property.leaseEnd).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        )}
      </div>

      {/* Financial strip */}
      <div
        style={{
          display: "flex",
          borderTop: `1px solid ${HAIRLINE}`,
          background: CREAM,
        }}
      >
        {[
          { label: "YTD Income", value: fmt(property.ytdIncome), color: INK },
          { label: "YTD Expenses", value: fmt(property.ytdExpenses), color: MID },
          { label: "YTD Net", value: fmt(net), color: net >= 0 ? GREEN : RED },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: "1 1 0",
              padding: "14px 16px",
              borderRight: `1px solid ${HAIRLINE}`,
            }}
          >
            <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: DIM, marginBottom: 4 }}>
              {item.label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: 14,
                fontWeight: 500,
                color: item.color,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function OwnerDashboard() {
  const totalRent = PROPERTIES.reduce((s, p) => s + p.rent, 0);
  const totalIncome = PROPERTIES.reduce((s, p) => s + p.ytdIncome, 0);
  const totalExpenses = PROPERTIES.reduce((s, p) => s + p.ytdExpenses, 0);
  const totalNet = totalIncome - totalExpenses;

  return (
    <>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 28 }}
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
          Portfolio Overview
        </h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: DIM, marginTop: 6 }}>
          Year-to-date performance across your properties
        </p>
      </motion.div>

      {/* KPI row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
      >
        <KpiCard
          label="Properties"
          value={String(PROPERTIES.length)}
          icon={Building2}
          delay={0.05}
        />
        <KpiCard
          label="Monthly Income"
          value={fmt(totalRent)}
          icon={DollarSign}
          delay={0.1}
        />
        <KpiCard
          label="YTD Expenses"
          value={fmt(totalExpenses)}
          icon={TrendingUp}
          delay={0.15}
        />
        <KpiCard
          label="YTD Net Cash Flow"
          value={fmt(totalNet)}
          icon={TrendingUp}
          delay={0.2}
        />
      </div>

      {/* Property cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {PROPERTIES.map((p, i) => (
          <PropertyCard key={p.id} property={p} index={i} />
        ))}
      </div>
    </>
  );
}
