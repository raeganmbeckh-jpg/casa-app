import type {
  PortfolioProperty,
  Tenant,
  Lease,
  WorkOrder,
  Transaction,
  CasaAlert,
} from "./types";

const KEYS = {
  properties: "casa-properties",
  tenants: "casa-tenants",
  leases: "casa-leases",
  workorders: "casa-workorders",
  transactions: "casa-transactions",
  alerts: "casa-alerts",
} as const;

function get<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ── Properties ───────────────────────────────────────────────────

export function getProperties(): PortfolioProperty[] {
  return get<PortfolioProperty>(KEYS.properties);
}

export function addProperty(p: Omit<PortfolioProperty, "id" | "added_at">): PortfolioProperty {
  const prop: PortfolioProperty = { ...p, id: uid(), added_at: new Date().toISOString() };
  const all = getProperties();
  all.push(prop);
  set(KEYS.properties, all);
  generateAlerts();
  return prop;
}

export function updateProperty(id: string, updates: Partial<PortfolioProperty>) {
  const all = getProperties();
  const idx = all.findIndex((p) => p.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    set(KEYS.properties, all);
  }
  generateAlerts();
}

export function removeProperty(id: string) {
  set(KEYS.properties, getProperties().filter((p) => p.id !== id));
  set(KEYS.tenants, getTenants().filter((t) => t.property_id !== id));
  set(KEYS.leases, getLeases().filter((l) => l.property_id !== id));
  set(KEYS.workorders, getWorkOrders().filter((w) => w.property_id !== id));
  set(KEYS.transactions, getTransactions().filter((t) => t.property_id !== id));
  generateAlerts();
}

// ── Tenants ──────────────────────────────────────────────────────

export function getTenants(): Tenant[] {
  return get<Tenant>(KEYS.tenants);
}

export function addTenant(t: Omit<Tenant, "id">): Tenant {
  const tenant: Tenant = { ...t, id: uid() };
  const all = getTenants();
  all.push(tenant);
  set(KEYS.tenants, all);
  return tenant;
}

export function updateTenant(id: string, updates: Partial<Tenant>) {
  const all = getTenants();
  const idx = all.findIndex((t) => t.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    set(KEYS.tenants, all);
  }
}

export function removeTenant(id: string) {
  set(KEYS.tenants, getTenants().filter((t) => t.id !== id));
}

// ── Leases ───────────────────────────────────────────────────────

export function getLeases(): Lease[] {
  return get<Lease>(KEYS.leases);
}

export function addLease(l: Omit<Lease, "id">): Lease {
  const lease: Lease = { ...l, id: uid() };
  const all = getLeases();
  all.push(lease);
  set(KEYS.leases, all);
  generateAlerts();
  return lease;
}

export function updateLease(id: string, updates: Partial<Lease>) {
  const all = getLeases();
  const idx = all.findIndex((l) => l.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    set(KEYS.leases, all);
  }
  generateAlerts();
}

// ── Work Orders ──────────────────────────────────────────────────

export function getWorkOrders(): WorkOrder[] {
  return get<WorkOrder>(KEYS.workorders);
}

export function addWorkOrder(w: Omit<WorkOrder, "id" | "created_at">): WorkOrder {
  const wo: WorkOrder = {
    ...w,
    id: uid(),
    created_at: new Date().toISOString(),
  };
  const all = getWorkOrders();
  all.push(wo);
  set(KEYS.workorders, all);
  return wo;
}

export function updateWorkOrder(id: string, updates: Partial<WorkOrder>) {
  const all = getWorkOrders();
  const idx = all.findIndex((w) => w.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    set(KEYS.workorders, all);
  }
}

// ── Transactions ─────────────────────────────────────────────────

export function getTransactions(): Transaction[] {
  return get<Transaction>(KEYS.transactions);
}

export function addTransaction(t: Omit<Transaction, "id">): Transaction {
  const tx: Transaction = { ...t, id: uid() };
  const all = getTransactions();
  all.push(tx);
  set(KEYS.transactions, all);
  return tx;
}

// ── Alerts ───────────────────────────────────────────────────────

export function getAlerts(): CasaAlert[] {
  return get<CasaAlert>(KEYS.alerts);
}

export function dismissAlert(id: string) {
  const all = getAlerts();
  const idx = all.findIndex((a) => a.id === id);
  if (idx >= 0) {
    all[idx].dismissed = true;
    set(KEYS.alerts, all);
  }
}

export function generateAlerts() {
  const properties = getProperties();
  const leases = getLeases();
  const tenants = getTenants();
  const now = new Date();
  const alerts: CasaAlert[] = [];

  for (const p of properties) {
    // Vacant unit
    if (p.status === "vacant") {
      alerts.push({
        id: `alert-vacant-${p.id}`,
        property_id: p.id,
        type: "vacant_unit",
        message: `${p.address} is vacant — no active lease`,
        severity: "warning",
        created_at: now.toISOString(),
        dismissed: false,
      });
    }

    // Aging systems
    if (p.year_built) {
      const age = now.getFullYear() - p.year_built;
      if (age > 18) {
        alerts.push({
          id: `alert-hvac-${p.id}`,
          property_id: p.id,
          type: "aging_system",
          message: `HVAC at ${p.address} is est. ${age > 20 ? Math.round(age * 0.7) : age}y old — approaching end of life`,
          severity: age > 22 ? "critical" : "warning",
          created_at: now.toISOString(),
          dismissed: false,
        });
      }
      if (age > 20) {
        alerts.push({
          id: `alert-roof-${p.id}`,
          property_id: p.id,
          type: "aging_system",
          message: `Roof at ${p.address} is est. ${Math.round(age * 0.8)}y old — schedule inspection`,
          severity: age > 25 ? "critical" : "warning",
          created_at: now.toISOString(),
          dismissed: false,
        });
      }
    }
  }

  // Expiring leases
  for (const l of leases) {
    const end = new Date(l.end_date);
    const daysLeft = Math.round((end.getTime() - now.getTime()) / 86400000);
    if (daysLeft > 0 && daysLeft <= 60) {
      const prop = properties.find((p) => p.id === l.property_id);
      alerts.push({
        id: `alert-lease-${l.id}`,
        property_id: l.property_id,
        type: "expiring_lease",
        message: `Lease at ${prop?.address || "property"} expires in ${daysLeft} days`,
        severity: daysLeft <= 30 ? "critical" : "warning",
        created_at: now.toISOString(),
        dismissed: false,
      });
    }
  }

  // Overdue rent (check payment history)
  for (const t of tenants) {
    const lastPayment = t.payment_history?.[t.payment_history.length - 1];
    if (lastPayment?.status === "missed" || lastPayment?.status === "late") {
      const prop = properties.find((p) => p.id === t.property_id);
      alerts.push({
        id: `alert-rent-${t.id}`,
        property_id: t.property_id,
        type: "overdue_rent",
        message: `${t.name} at ${prop?.address || "property"} — rent ${lastPayment.status}`,
        severity: "critical",
        created_at: now.toISOString(),
        dismissed: false,
      });
    }
  }

  // Merge with existing dismissed state
  const existing = getAlerts();
  const dismissedIds = new Set(existing.filter((a) => a.dismissed).map((a) => a.id));
  for (const a of alerts) {
    if (dismissedIds.has(a.id)) a.dismissed = true;
  }

  set(KEYS.alerts, alerts);
}

// ── Helpers ──────────────────────────────────────────────────────

export function getPropertyAddress(id: string): string {
  return getProperties().find((p) => p.id === id)?.address || "Unknown";
}

export function propertyFromAttom(basic: any, detail: any): Omit<PortfolioProperty, "id" | "added_at"> {
  const prop = detail || basic;
  const addr = prop?.address || {};
  return {
    address: addr.line1 || "",
    city: addr.locality || "",
    state: addr.countrySubd || "",
    zip: addr.postal1 || "",
    property_type: prop?.summary?.proptype || prop?.summary?.propsubtype || "SFR",
    beds: prop?.building?.rooms?.beds ?? null,
    baths: prop?.building?.rooms?.bathsFull ?? null,
    sqft: prop?.building?.size?.livingSize || prop?.building?.size?.bldgSize || null,
    year_built: prop?.summary?.yearbuilt ?? null,
    estimated_value: detail?.assessment?.market?.mktTtlValue || prop?.assessment?.market?.mktTtlValue || null,
    assessed_value: detail?.assessment?.assessed?.assdTtlValue || prop?.assessment?.assessed?.assdTtlValue || null,
    monthly_rent: 0,
    status: "prospecting",
    owner_name: detail?.assessment?.owner?.owner1?.fullName || null,
    apn: prop?.identifier?.apn || null,
    annual_taxes: detail?.assessment?.tax?.taxAmt || null,
    last_sale_date: detail?.sale?.saleTransDate || null,
    last_sale_price: detail?.sale?.saleTransAmount || null,
    flood_zone: detail?.lot?.floodZoneCode || null,
    lot_sqft: prop?.lot?.lotSize2 || null,
    attom_raw: { basic, detail },
  };
}
