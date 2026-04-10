export interface PortfolioProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  estimated_value: number | null;
  assessed_value: number | null;
  monthly_rent: number;
  status: "occupied" | "vacant" | "maintenance" | "prospecting";
  owner_name: string | null;
  apn: string | null;
  annual_taxes: number | null;
  last_sale_date: string | null;
  last_sale_price: number | null;
  flood_zone: string | null;
  lot_sqft: number | null;
  added_at: string;
  attom_raw?: any;
}

export interface Tenant {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  credit_score: number;
  monthly_income: number;
  income_verified: boolean;
  background_check: "passed" | "pending" | "flagged";
  move_in_date: string;
  eviction_risk: number;
  payment_history: PaymentRecord[];
}

export interface PaymentRecord {
  date: string;
  amount: number;
  status: "paid" | "late" | "missed";
}

export interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  late_fee: number;
  grace_days: number;
  esign_status: "signed" | "pending" | "expired";
  auto_renew: boolean;
}

export interface WorkOrder {
  id: string;
  property_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "emergency";
  status: "open" | "in_progress" | "completed";
  vendor: string;
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
  completed_at: string | null;
  recurring: boolean;
  photos: string[];
}

export interface Transaction {
  id: string;
  property_id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface CasaAlert {
  id: string;
  property_id: string | null;
  type: "overdue_rent" | "expiring_lease" | "aging_system" | "vacant_unit" | "maintenance";
  message: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  dismissed: boolean;
}
