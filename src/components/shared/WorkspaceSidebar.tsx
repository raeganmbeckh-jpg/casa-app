'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const managementPages = [
  { label: 'Portfolio Overview', path: '/management' },
  { label: 'Property Detail', path: '/management/property-detail' },
  { label: 'Tenant Management', path: '/management/tenants' },
  { label: 'Maintenance & Operations', path: '/management/maintenance' },
  { label: 'Financials', path: '/management/financials' },
  { label: 'Compliance Center', path: '/management/compliance' },
  { label: 'Market Position', path: '/management/market-position' },
  { label: 'Owner Reports', path: '/management/reports' },
];

const investmentPages = [
  { label: 'Deal Pipeline', path: '/investment' },
  { label: 'Underwriting Engine', path: '/investment/underwriting' },
  { label: 'QIS Dashboard', path: '/investment/qis' },
  { label: 'Buyer Demand Simulator', path: '/investment/buyer-demand' },
  { label: 'Comp Engine', path: '/investment/comps' },
  { label: 'Portfolio Analytics', path: '/investment/portfolio' },
  { label: 'Capital Stack Modeler', path: '/investment/capital-stack' },
  { label: 'Exit Strategy Planner', path: '/investment/exit-strategy' },
];

const developmentPages = [
  { label: 'Project Pipeline', path: '/development' },
  { label: 'Pro Forma Modeler', path: '/development/pro-forma' },
  { label: 'Construction Schedule', path: '/development/schedule' },
  { label: 'Permit & Entitlement Tracker', path: '/development/permits' },
  { label: 'Vendor & Contractor Mgmt', path: '/development/vendors' },
  { label: 'Cost Variance Analytics', path: '/development/cost-variance' },
  { label: 'Material Pricing Intelligence', path: '/development/materials' },
  { label: 'Stakeholder Communications', path: '/development/stakeholders' },
];

const landPages = [
  { label: 'Parcel Search & Map', path: '/land' },
  { label: 'Zoning & Entitlement', path: '/land/zoning' },
  { label: 'Highest & Best Use', path: '/land/hbu' },
  { label: 'Environmental & Geotech Risk', path: '/land/environmental' },
  { label: 'Utility & Infrastructure', path: '/land/utilities' },
  { label: 'Comparable Land Sales', path: '/land/comps' },
  { label: 'Acquisition Modeler', path: '/land/acquisition' },
  { label: 'Owner Outreach', path: '/land/outreach' },
];

const brokeragePages = [
  { label: 'Listing Pipeline', path: '/brokerage' },
  { label: 'CMA Generator', path: '/brokerage/cma' },
  { label: 'Buyer Matching', path: '/brokerage/buyer-matching' },
  { label: 'Pricing Strategy', path: '/brokerage/pricing' },
  { label: 'Days-on-Market Forecaster', path: '/brokerage/dom-forecast' },
  { label: 'Marketing Performance', path: '/brokerage/marketing' },
  { label: 'Commission & Pipeline', path: '/brokerage/pipeline' },
  { label: 'Local Market Pulse', path: '/brokerage/market-pulse' },
];

const lendingPages = [
  { label: 'Loan Pipeline', path: '/lending' },
  { label: 'Underwriting Dashboard', path: '/lending/underwriting' },
  { label: 'Borrower Profile Analysis', path: '/lending/borrower' },
  { label: 'Property Risk Assessment', path: '/lending/property-risk' },
  { label: 'Rate & Term Modeler', path: '/lending/rate-term' },
  { label: 'Covenant Monitoring', path: '/lending/covenants' },
  { label: 'Default Risk Predictor', path: '/lending/default-risk' },
  { label: 'Capital Markets Pulse', path: '/lending/markets' },
];

const pagesByWorkspace: Record<string, typeof managementPages> = {
  management: managementPages,
  investment: investmentPages,
  development: developmentPages,
  land: landPages,
  brokerage: brokeragePages,
  lending: lendingPages,
};

export default function WorkspaceSidebar() {
  const pathname = usePathname();
  const workspace = pathname?.split('/')[1];
  const pages = workspace ? pagesByWorkspace[workspace] || [] : [];

  if (!workspace || !pages.length) return null;

  return (
    <aside className="w-64 border-r border-gray-200 min-h-screen bg-gray-50 p-6">
      <nav className="space-y-1">
        {pages.map((page) => {
          const isActive = pathname === page.path;
          return (
            <Link
              key={page.path}
              href={page.path}
              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#F9D96A] text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}