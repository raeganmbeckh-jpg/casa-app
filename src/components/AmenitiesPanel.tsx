"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Home, Car, Zap, Droplets, Sun, Shield,
  Plus, Check, X, Flame, Wind, ChevronDown,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TX = "#1A1A1A";
const TX2 = "#6B6B6B";
const BORDER = "#EEEEEE";

interface Amenities {
  pool: "none" | "in-ground" | "above-ground" | "shared";
  spa: boolean;
  outdoorKitchen: boolean;
  deckPatio: boolean;
  deckSqft: number;
  yardType: "none" | "front" | "back" | "both" | "xeriscape";
  garageSpaces: number;
  garageType: "attached" | "detached" | "carport" | "none";
  driveway: boolean;
  streetParking: boolean;
  evCharging: boolean;
  fireplace: boolean;
  fireplaceCount: number;
  laundry: "in-unit" | "shared" | "hookups" | "none";
  centralAC: boolean;
  smartHome: string[];
  solarInstalled: boolean;
  solarKw: number;
  batteryBackup: boolean;
  evCharger: boolean;
  energyStar: boolean;
  hoa: boolean;
  hoaFee: number;
  hoaName: string;
  hoaIncludes: string[];
}

interface Renovation {
  year: number;
  type: string;
  cost: number;
  notes: string;
}

interface AmenitiesPanelProps {
  address: string;
  apn?: string;
  attomData?: any;
}

const defaultAmenities: Amenities = {
  pool: "none", spa: false, outdoorKitchen: false, deckPatio: false,
  deckSqft: 0, yardType: "none", garageSpaces: 0, garageType: "none",
  driveway: false, streetParking: false, evCharging: false, fireplace: false,
  fireplaceCount: 0, laundry: "none", centralAC: false, smartHome: [],
  solarInstalled: false, solarKw: 0, batteryBackup: false, evCharger: false,
  energyStar: false, hoa: false, hoaFee: 0, hoaName: "", hoaIncludes: [],
};

const renoTypes = [
  "Kitchen", "Bathroom", "Roof", "HVAC", "Addition",
  "Full Remodel", "Flooring", "Electrical", "Plumbing", "Other",
];

const smartHomeOptions = ["Nest", "Ring", "Smart Lock", "Solar", "EV Charger"];
const hoaIncludesOptions = ["Water", "Trash", "Exterior", "Pool", "Landscaping"];

/* ── tiny reusable pieces ── */

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <div
    onClick={onToggle}
    style={{
      width: 32, height: 18, borderRadius: 9, cursor: "pointer",
      backgroundColor: on ? ACCENT : BORDER, position: "relative",
      transition: "background-color 0.2s",
    }}
  >
    <div style={{
      width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff",
      position: "absolute", top: 2, left: on ? 16 : 2,
      transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,.15)",
    }} />
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
    <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: TX }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{children}</div>
  </div>
);

const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      fontFamily: "var(--font-inter)", fontSize: 12, color: TX, border: `1px solid ${BORDER}`,
      borderRadius: 6, padding: "3px 8px", backgroundColor: "#fff", cursor: "pointer",
    }}
  >
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const NumInput = ({ value, onChange, min = 0, max = 9999, width = 60, prefix }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; width?: number; prefix?: string;
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    {prefix && <span style={{ fontSize: 12, color: TX2 }}>{prefix}</span>}
    <input
      type="number" min={min} max={max} value={value}
      onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      style={{
        width, fontFamily: "var(--font-inter)", fontSize: 12, color: TX,
        border: `1px solid ${BORDER}`, borderRadius: 6, padding: "3px 6px", textAlign: "right",
      }}
    />
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontFamily: "var(--font-heading)", fontSize: 14, color: GOLD,
    fontWeight: 600, margin: "14px 0 6px", letterSpacing: 0.4,
  }}>
    {children}
  </div>
);

const MultiCheck = ({ options, selected, onChange }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {options.map(o => {
      const on = selected.includes(o);
      return (
        <div key={o} onClick={() => onChange(on ? selected.filter(s => s !== o) : [...selected, o])}
          style={{
            fontSize: 11, fontFamily: "var(--font-inter)", padding: "3px 8px", borderRadius: 12,
            cursor: "pointer", border: `1px solid ${on ? ACCENT : BORDER}`,
            backgroundColor: on ? ACCENT : "#fff", color: on ? TX : TX2, transition: "all 0.15s",
          }}>
          {o}
        </div>
      );
    })}
  </div>
);

/* ── main component ── */

export default function AmenitiesPanel({ address, apn, attomData }: AmenitiesPanelProps) {
  const [amenities, setAmenities] = useState<Amenities>({ ...defaultAmenities });
  const [renovations, setRenovations] = useState<Renovation[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddReno, setShowAddReno] = useState(false);
  const [newReno, setNewReno] = useState<Renovation>({ year: 2024, type: "Kitchen", cost: 0, notes: "" });

  const set = useCallback(<K extends keyof Amenities>(key: K, val: Amenities[K]) => {
    setAmenities(prev => ({ ...prev, [key]: val }));
  }, []);

  /* load from supabase + attom pre-populate */
  useEffect(() => {
    if (!address) return;
    (async () => {
      const { data } = await supabase
        .from("property_amenities")
        .select("*")
        .eq("address", address)
        .maybeSingle();

      const base: Amenities = { ...defaultAmenities };

      // pre-populate from attomData
      if (attomData) {
        const parking = attomData?.building?.parking?.prkgSpaces;
        if (parking && parking > 0) { base.garageSpaces = parking; base.garageType = "attached"; }
        const pool = attomData?.building?.summary?.pool;
        if (pool && pool !== "0" && pool !== false) base.pool = "in-ground";
        const fplc = attomData?.building?.interior?.fplcCount;
        if (fplc && fplc > 0) { base.fireplace = true; base.fireplaceCount = fplc; }
      }

      if (data) {
        const a = data.amenities ?? {};
        setAmenities({ ...base, ...a });
        setRenovations(data.renovations ?? []);
      } else {
        setAmenities(base);
      }
    })();
  }, [address, attomData]);

  /* save */
  const save = async () => {
    setSaving(true);
    const payload = { address, apn: apn ?? null, amenities, renovations, updated_at: new Date().toISOString() };
    const { data: existing } = await supabase
      .from("property_amenities").select("id").eq("address", address).maybeSingle();
    if (existing) {
      await supabase.from("property_amenities").update(payload).eq("address", address);
    } else {
      await supabase.from("property_amenities").insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addReno = () => {
    const updated = [...renovations, { ...newReno }].sort((a, b) => b.year - a.year);
    setRenovations(updated);
    setNewReno({ year: 2024, type: "Kitchen", cost: 0, notes: "" });
    setShowAddReno(false);
  };

  return (
    <div style={{
      borderLeft: `4px solid ${ACCENT}`, backgroundColor: "#fff",
      border: `1px solid ${BORDER}`, borderLeftWidth: 4, borderLeftColor: ACCENT,
      borderRadius: 10, padding: "20px 22px",
      boxShadow: "0 2px 8px rgba(0,0,0,.06)",
    }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Home size={20} color={GOLD} />
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: GOLD, fontWeight: 700 }}>
          Amenities &amp; Features
        </span>
      </div>

      {/* ── OUTDOOR ── */}
      <SectionTitle>OUTDOOR</SectionTitle>
      <Row label="Pool">
        <Select value={amenities.pool} onChange={v => set("pool", v as Amenities["pool"])}
          options={["none", "in-ground", "above-ground", "shared"]} />
      </Row>
      <Row label="Spa / Hot Tub">
        <Toggle on={amenities.spa} onToggle={() => set("spa", !amenities.spa)} />
      </Row>
      <Row label="Outdoor Kitchen">
        <Toggle on={amenities.outdoorKitchen} onToggle={() => set("outdoorKitchen", !amenities.outdoorKitchen)} />
      </Row>
      <Row label="Deck / Patio">
        <Toggle on={amenities.deckPatio} onToggle={() => set("deckPatio", !amenities.deckPatio)} />
        {amenities.deckPatio && <NumInput value={amenities.deckSqft} onChange={v => set("deckSqft", v)} prefix="sqft" />}
      </Row>
      <Row label="Yard">
        <Select value={amenities.yardType} onChange={v => set("yardType", v as Amenities["yardType"])}
          options={["none", "front", "back", "both", "xeriscape"]} />
      </Row>

      {/* ── PARKING ── */}
      <SectionTitle>PARKING</SectionTitle>
      <Row label="Garage Spaces">
        <NumInput value={amenities.garageSpaces} onChange={v => set("garageSpaces", v)} min={0} max={6} width={48} />
      </Row>
      <Row label="Garage Type">
        <Select value={amenities.garageType} onChange={v => set("garageType", v as Amenities["garageType"])}
          options={["none", "attached", "detached", "carport"]} />
      </Row>
      <Row label="Driveway">
        <Toggle on={amenities.driveway} onToggle={() => set("driveway", !amenities.driveway)} />
      </Row>
      <Row label="Street Parking">
        <Toggle on={amenities.streetParking} onToggle={() => set("streetParking", !amenities.streetParking)} />
      </Row>
      <Row label="EV Charging">
        <Toggle on={amenities.evCharging} onToggle={() => set("evCharging", !amenities.evCharging)} />
      </Row>

      {/* ── INTERIOR ── */}
      <SectionTitle>INTERIOR</SectionTitle>
      <Row label="Fireplace">
        <Toggle on={amenities.fireplace} onToggle={() => set("fireplace", !amenities.fireplace)} />
        {amenities.fireplace && <NumInput value={amenities.fireplaceCount} onChange={v => set("fireplaceCount", v)} min={0} max={10} width={48} />}
      </Row>
      <Row label="Laundry">
        <Select value={amenities.laundry} onChange={v => set("laundry", v as Amenities["laundry"])}
          options={["none", "in-unit", "shared", "hookups"]} />
      </Row>
      <Row label="Central AC">
        <Toggle on={amenities.centralAC} onToggle={() => set("centralAC", !amenities.centralAC)} />
      </Row>
      <div style={{ padding: "6px 0" }}>
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: TX }}>Smart Home</span>
        <div style={{ marginTop: 6 }}>
          <MultiCheck options={smartHomeOptions} selected={amenities.smartHome}
            onChange={v => set("smartHome", v)} />
        </div>
      </div>

      {/* ── SUSTAINABILITY ── */}
      <SectionTitle>SUSTAINABILITY</SectionTitle>
      <Row label="Solar Installed">
        <Toggle on={amenities.solarInstalled} onToggle={() => set("solarInstalled", !amenities.solarInstalled)} />
        {amenities.solarInstalled && <NumInput value={amenities.solarKw} onChange={v => set("solarKw", v)} prefix="kW" width={56} />}
      </Row>
      <Row label="Battery Backup">
        <Toggle on={amenities.batteryBackup} onToggle={() => set("batteryBackup", !amenities.batteryBackup)} />
      </Row>
      <Row label="EV Charger">
        <Toggle on={amenities.evCharger} onToggle={() => set("evCharger", !amenities.evCharger)} />
      </Row>
      <Row label="Energy Star">
        <Toggle on={amenities.energyStar} onToggle={() => set("energyStar", !amenities.energyStar)} />
      </Row>

      {/* ── HOA ── */}
      <SectionTitle>HOA</SectionTitle>
      <Row label="HOA">
        <Toggle on={amenities.hoa} onToggle={() => set("hoa", !amenities.hoa)} />
      </Row>
      {amenities.hoa && (
        <>
          <Row label="Monthly Fee">
            <NumInput value={amenities.hoaFee} onChange={v => set("hoaFee", v)} prefix="$" width={80} />
          </Row>
          <Row label="HOA Name">
            <input value={amenities.hoaName} onChange={e => set("hoaName", e.target.value)}
              placeholder="Name"
              style={{
                fontFamily: "var(--font-inter)", fontSize: 12, color: TX,
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: "3px 8px", width: 140,
              }} />
          </Row>
          <div style={{ padding: "6px 0" }}>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: TX }}>Includes</span>
            <div style={{ marginTop: 6 }}>
              <MultiCheck options={hoaIncludesOptions} selected={amenities.hoaIncludes}
                onChange={v => set("hoaIncludes", v)} />
            </div>
          </div>
        </>
      )}

      {/* ── SAVE ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <button onClick={save} disabled={saving}
          style={{
            fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 600,
            backgroundColor: saving ? "#ccc" : GOLD, color: "#fff",
            border: "none", borderRadius: 999, padding: "8px 22px",
            cursor: saving ? "not-allowed" : "pointer", transition: "background-color 0.2s",
          }}>
          {saved ? "Saved \u2713" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ── RENOVATION HISTORY ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 22, paddingTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: GOLD, fontWeight: 700 }}>
            Renovation History
          </span>
          <button onClick={() => setShowAddReno(!showAddReno)}
            style={{
              display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-inter)",
              fontSize: 12, color: GOLD, background: "none", border: `1px solid ${ACCENT}`,
              borderRadius: 999, padding: "4px 12px", cursor: "pointer",
            }}>
            {showAddReno ? <X size={12} /> : <Plus size={12} />}
            {showAddReno ? "Cancel" : "+ Add Renovation"}
          </button>
        </div>

        {/* add renovation form */}
        {showAddReno && (
          <div style={{
            border: `1px solid ${BORDER}`, borderRadius: 8, padding: 14, marginBottom: 14,
            backgroundColor: "#FAFAFA",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: TX2, fontFamily: "var(--font-inter)", display: "block", marginBottom: 2 }}>Year</label>
                <input type="number" min={1950} max={2026} value={newReno.year}
                  onChange={e => setNewReno(p => ({ ...p, year: Number(e.target.value) || 2024 }))}
                  style={{
                    width: 64, fontFamily: "var(--font-inter)", fontSize: 12, color: TX,
                    border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 6px",
                  }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: TX2, fontFamily: "var(--font-inter)", display: "block", marginBottom: 2 }}>Type</label>
                <select value={newReno.type} onChange={e => setNewReno(p => ({ ...p, type: e.target.value }))}
                  style={{
                    fontFamily: "var(--font-inter)", fontSize: 12, color: TX,
                    border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", backgroundColor: "#fff",
                  }}>
                  {renoTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: TX2, fontFamily: "var(--font-inter)", display: "block", marginBottom: 2 }}>Cost</label>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 12, color: TX2 }}>$</span>
                  <input type="number" min={0} value={newReno.cost}
                    onChange={e => setNewReno(p => ({ ...p, cost: Number(e.target.value) || 0 }))}
                    style={{
                      width: 80, fontFamily: "var(--font-inter)", fontSize: 12, color: TX,
                      border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 6px",
                    }} />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: TX2, fontFamily: "var(--font-inter)", display: "block", marginBottom: 2 }}>Notes</label>
              <input value={newReno.notes} onChange={e => setNewReno(p => ({ ...p, notes: e.target.value }))}
                placeholder="Details about the renovation..."
                style={{
                  width: "100%", boxSizing: "border-box", fontFamily: "var(--font-inter)", fontSize: 12,
                  color: TX, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px",
                }} />
            </div>
            <button onClick={addReno}
              style={{
                fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600,
                backgroundColor: GOLD, color: "#fff", border: "none", borderRadius: 999,
                padding: "6px 16px", cursor: "pointer",
              }}>
              <Check size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
              Add Renovation
            </button>
          </div>
        )}

        {/* timeline */}
        {renovations.length === 0 ? (
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: TX2, textAlign: "center", padding: "18px 0" }}>
            No renovations recorded. Add your first renovation above.
          </p>
        ) : (
          <div style={{ position: "relative", paddingLeft: 20 }}>
            {/* vertical line */}
            <div style={{
              position: "absolute", left: 5, top: 4, bottom: 4, width: 2,
              backgroundColor: BORDER,
            }} />
            {renovations.map((r, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 14 }}>
                {/* dot */}
                <div style={{
                  position: "absolute", left: -20, top: 4, width: 12, height: 12,
                  borderRadius: 6, backgroundColor: ACCENT, border: "2px solid #fff",
                  boxShadow: "0 0 0 1px " + BORDER,
                }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 700, color: TX }}>
                    {r.year}
                  </span>
                  <span style={{
                    fontSize: 11, fontFamily: "var(--font-inter)", backgroundColor: ACCENT,
                    color: TX, padding: "1px 8px", borderRadius: 999, fontWeight: 500,
                  }}>
                    {r.type}
                  </span>
                  {r.cost > 0 && (
                    <span style={{ fontSize: 12, fontFamily: "var(--font-inter)", color: TX2 }}>
                      ${r.cost.toLocaleString()}
                    </span>
                  )}
                </div>
                {r.notes && (
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: TX2, margin: "2px 0 0" }}>
                    {r.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
