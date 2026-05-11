import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface WorkspaceLayoutProps {
  children: ReactNode;
  workspace: 'management' | 'investment' | 'development' | 'land' | 'brokerage' | 'lending';
}

const workspaceConfig = {
  management: {
    label: 'Management',
    icon: '🏢',
    pages: [
      { label: 'Portfolio Overview', path: '/management/portfolio' },
      { label: 'Property Detail', path: '/management/property' },
      { label: 'Tenant Management', path: '/management/tenants' },
      { label: 'Maintenance & Operations', path: '/management/maintenance' },
      { label: 'Financials', path: '/management/financials' },
      { label: 'Compliance Center', path: '/management/compliance' },
      { label: 'Market Position', path: '/management/market' },
      { label: 'Owner Reports', path: '/management/reports' },
    ],
  },
  investment: {
    label: 'Investment',
    icon: '📊',
    pages: [
      { label: 'Deal Pipeline', path: '/investment/pipeline' },
      { label: 'Underwriting Engine', path: '/investment/underwriting' },
      { label: 'QIS Dashboard', path: '/investment/qis' },
      { label: 'Buyer Demand Simulator', path: '/investment/buyer-demand' },
      { label: 'Comp Engine', path: '/investment/comps' },
      { label: 'Portfolio Analytics', path: '/investment/portfolio' },
      { label: 'Capital Stack Modeler', path: '/investment/capital-stack' },
      { label: 'Exit Strategy Planner', path: '/investment/exit-strategy' },
    ],
  },
  development: {
    label: 'Development',
    icon: '🏗️',
    pages: [
      { label: 'Project Pipeline', path: '/development/pipeline' },
      { label: 'Pro Forma Modeler', path: '/development/proforma' },
      { label: 'Construction Schedule', path: '/development/schedule' },
      { label: 'Permit & Entitlement Tracker', path: '/development/permits' },
      { label: 'Vendor & Contractor Management', path: '/development/vendors' },
      { label: 'Cost Variance Analytics', path: '/development/cost-variance' },
      { label: 'Material Pricing Intelligence', path: '/development/materials' },
      { label: 'Stakeholder Communications', path: '/development/communications' },
    ],
  },
  land: {
    label: 'Land Acquisition',
    icon: '🗺️',
    pages: [
      { label: 'Parcel Search & Map', path: '/land/search' },
      { label: 'Zoning & Entitlement', path: '/land/zoning' },
      { label: 'Highest & Best Use', path: '/land/hbu' },
      { label: 'Environmental & Geotechnical', path: '/land/environmental' },
      { label: 'Utility & Infrastructure', path: '/land/utilities' },
      { label: 'Comparable Land Sales', path: '/land/comps' },
      { label: 'Acquisition Modeler', path: '/land/acquisition' },
      { label: 'Owner Outreach', path: '/land/outreach' },
    ],
  },
  brokerage: {
    label: 'Brokerage',
    icon: '🏠',
    pages: [
      { label: 'Listing Pipeline', path: '/brokerage/pipeline' },
      { label: 'CMA Generator', path: '/brokerage/cma' },
      { label: 'Buyer Matching', path: '/brokerage/buyer-matching' },
      { label: 'Pricing Strategy', path: '/brokerage/pricing' },
      { label: 'Days-on-Market Forecaster', path: '/brokerage/dom-forecast' },
      { label: 'Marketing Performance', path: '/brokerage/marketing' },
      { label: 'Commission & Pipeline Tracker', path: '/brokerage/commission' },
      { label: 'Local Market Pulse', path: '/brokerage/market-pulse' },
    ],
  },
  lending: {
    label: 'Lending',
    icon: '💰',
    pages: [
      { label: 'Loan Pipeline', path: '/lending/pipeline' },
      { label: 'Underwriting Dashboard', path: '/lending/underwriting' },
      { label: 'Borrower Profile Analysis', path: '/lending/borrower' },
      { label: 'Property Risk Assessment', path: '/lending/property-risk' },
      { label: 'Rate & Term Modeler', path: '/lending/rate-term' },
      { label: 'Covenant Monitoring', path: '/lending/covenants' },
      { label: 'Default Risk Predictor', path: '/lending/default-risk' },
      { label: 'Capital Markets Pulse', path: '/lending/capital-markets' },
    ],
  },
};

const allWorkspaces = Object.keys(workspaceConfig) as Array<keyof typeof workspaceConfig>;

export default function WorkspaceLayout({ children, workspace }: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const config = workspaceConfig[workspace];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/" className="text-2xl font-serif" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            CASA
          </Link>
        </div>

        {/* Workspace Switcher */}
        <div className="p-4 border-b border-gray-200">
          <select
            value={workspace}
            onChange={(e) => {
              const newWorkspace = e.target.value;
              const firstPage = workspaceConfig[newWorkspace as keyof typeof workspaceConfig].pages[0];
              window.location.href = firstPage.path;
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          >
            {allWorkspaces.map((ws) => (
              <option key={ws} value={ws}>
                {workspaceConfig[ws].icon} {workspaceConfig[ws].label}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {config.pages.map((page) => {
              const isActive = pathname === page.path;
              return (
                <li key={page.path}>
                  <Link
                    href={page.path}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-[#F9D96A] text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#F9D96A] rounded-full flex items-center justify-center text-sm font-medium">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">User</p>
              <p className="text-xs text-gray-500 truncate">user@casa.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-2xl font-serif" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {config.label}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-600 hover:text-gray-900">Help</button>
            <button className="text-sm text-gray-600 hover:text-gray-900">Settings</button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
