"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bed,
  Bath,
  Maximize,
  Calendar,
  PawPrint,
  DollarSign,
  Wifi,
  Car,
  WashingMachine,
  Trees,
  Dumbbell,
  ShieldCheck,
  ArrowRight,
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

/* ═══════════════════════════════════════════════════════════════════
   MOCK LISTING DATA
   ═══════════════════════════════════════════════════════════════════ */

interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rent: number;
  beds: number;
  baths: number;
  sqft: number;
  availableDate: string;
  petPolicy: string;
  amenities: string[];
  description: string;
}

const LISTINGS: Record<string, Listing> = {
  "2167-villa-sonoma-glen": {
    id: "2167-villa-sonoma-glen",
    address: "2167 Villa Sonoma Glen",
    city: "Austin",
    state: "TX",
    zip: "78738",
    rent: 3200,
    beds: 3,
    baths: 2.5,
    sqft: 2150,
    availableDate: "2026-05-01",
    petPolicy: "Dogs & cats welcome (max 2 pets, 50 lb limit)",
    amenities: [
      "Central A/C",
      "In-unit washer/dryer",
      "Attached 2-car garage",
      "Private patio",
      "Hardwood floors",
      "Stainless steel appliances",
      "Quartz countertops",
      "Walk-in closets",
      "Smart thermostat",
      "High-speed internet ready",
      "Community pool",
      "Fitness center",
    ],
    description:
      "Nestled in the sought-after Sonoma neighborhood of Southwest Austin, this beautifully maintained 3-bedroom home offers an open floor plan with soaring ceilings, abundant natural light, and designer finishes throughout. The gourmet kitchen features quartz countertops, a large island, and stainless steel appliances. The primary suite includes a spa-inspired bath with dual vanities and a walk-in closet. Step outside to a private patio with mature landscaping and Hill Country views. Minutes from shopping, dining, and top-rated schools. No smoking.",
  },
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function DetailCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "16px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={14} color={DIM} />
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: DIM }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: 16,
          fontWeight: 500,
          color: INK,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function ListingPage() {
  const params = useParams();
  const id = params.id as string;
  const listing = LISTINGS[id] || LISTINGS["2167-villa-sonoma-glen"];

  return (
    <div style={{ minHeight: "100vh", background: CREAM }}>
      {/* ── Header ── */}
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: `1px solid ${HAIRLINE}`,
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 20,
              fontWeight: 600,
              color: INK,
              textDecoration: "none",
              letterSpacing: "-0.02em",
            }}
          >
            CASA
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* ── Address ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 24 }}
        >
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 36,
              fontWeight: 600,
              color: INK,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {listing.address}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 16,
              color: MID,
              margin: "6px 0 0",
            }}
          >
            {listing.city}, {listing.state} {listing.zip}
          </p>
        </motion.div>

        {/* ── Photo placeholder ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{
            background: "rgba(17,17,17,0.04)",
            borderRadius: 16,
            height: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            border: `1px solid ${HAIRLINE}`,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 15,
              color: DIM,
            }}
          >
            Photos coming soon
          </span>
        </motion.div>

        {/* ── Details grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            border: `1px solid ${HAIRLINE}`,
            padding: "4px 24px",
            marginBottom: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0 32px",
          }}
        >
          <DetailCell icon={DollarSign} label="Rent" value={`${fmt(listing.rent)}/mo`} />
          <DetailCell icon={Bed} label="Bedrooms" value={String(listing.beds)} />
          <DetailCell icon={Bath} label="Bathrooms" value={String(listing.baths)} />
          <DetailCell icon={Maximize} label="Sq Ft" value={listing.sqft.toLocaleString()} />
          <DetailCell
            icon={Calendar}
            label="Available"
            value={new Date(listing.availableDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          />
          <DetailCell icon={PawPrint} label="Pets" value={listing.petPolicy} />
        </motion.div>

        {/* ── Amenities ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ marginBottom: 28 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 22,
              fontWeight: 600,
              color: INK,
              margin: "0 0 14px",
            }}
          >
            Amenities
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {listing.amenities.map((a) => (
              <span
                key={a}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  color: INK,
                  background: "rgba(17,17,17,0.04)",
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 100,
                  padding: "6px 14px",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Description ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginBottom: 36 }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 22,
              fontWeight: 600,
              color: INK,
              margin: "0 0 12px",
            }}
          >
            About this property
          </h2>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 15,
              lineHeight: 1.7,
              color: MID,
              margin: 0,
              maxWidth: 720,
            }}
          >
            {listing.description}
          </p>
        </motion.div>

        {/* ── Apply button ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Link
            href={`/apply/${listing.id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-inter)",
              fontSize: 16,
              fontWeight: 600,
              color: INK,
              background: BUTTER,
              border: "none",
              borderRadius: 10,
              padding: "14px 32px",
              textDecoration: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(249,217,106,0.25)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
          >
            Apply Now
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${HAIRLINE}`,
          background: "#FFFFFF",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 18,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.02em",
            }}
          >
            CASA
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              color: DIM,
            }}
          >
            &copy; {new Date().getFullYear()} CASA. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
