'use client'

import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface Loan {
  id: string
  borrower: string
  property: string
  loanAmount: string
  loanType: string
  propertyType: string
  ltv: number
  dscr: number
  stage: string
  daysInStage: number
  riskScore: 'low' | 'medium' | 'high'
  rate: string
}

const mockLoans: Loan[] = [
  {
    id: 'LN-2024-0847',
    borrower: 'Redwood Capital LLC',
    property: '2847 Market Street, San Francisco, CA',
    loanAmount: '$12,500,000',
    loanType: 'Acquisition',
    propertyType: 'Multifamily',
    ltv: 72,
    dscr: 1.38,
    stage: 'Underwriting',
    daysInStage: 12,
    riskScore: 'low',
    rate: '6.25%',
  },
  {
    id: 'LN-2024-0846',
    borrower: 'Metropolitan Properties Inc',
    property: '15000 Innovation Drive, Austin, TX',
    loanAmount: '$8,750,000',
    loanType: 'Refinance',
    propertyType: 'Office',
    ltv: 65,
    dscr: 1.52,
    stage: 'Approval Pending',
    daysInStage: 8,
    riskScore: 'low',
    rate: '5.875%',
  },
  {
    id: 'LN-2024-0845',
    borrower: 'Skyline Development Group',
    property: '4200 Commerce Parkway, Miami, FL',
    loanAmount: '$15,200,000',
    loanType: 'Construction',
    propertyType: 'Mixed-Use',
    ltv: 78,
    dscr: 1.24,
    stage: 'Due Diligence',
    daysInStage: 19,
    riskScore: 'medium',
    rate: '7.125%',
  },
  {
    id: 'LN-2024-0844',
    borrower: 'Harbor Bay Investments',
    property: '890 Waterfront Boulevard, Seattle, WA',
    loanAmount: '$22,000,000',
    loanType: 'Bridge',
    propertyType: 'Retail',
    ltv: 68,
    dscr: 1.45,
    stage: 'Docs/Closing',
    daysInStage: 4,
    riskScore: 'low',
    rate: '6.75%',
  },
  {
    id: 'LN-2024-0843',
    borrower: 'Pinnacle Real Estate Partners',
    property: '3500 Industrial Way, Denver, CO',
    loanAmount: '$9,400,000',
    loanType: 'Acquisition',
    propertyType: 'Industrial',
    ltv: 71,
    dscr: 1.41,
    stage: 'Application',
    daysInStage: 6,
    riskScore: 'low',
    rate: '6.50%',
  },
  {
    id: 'LN-2024-0842',
    borrower: 'Cornerstone Holdings LLC',
    property: '1250 Main Street, Nashville, TN',
    loanAmount: '$18,600,000',
    loanType: 'Permanent',
    propertyType: 'Multifamily',
    ltv: 82,
    dscr: 1.18,
    stage: 'On Hold',
    daysInStage: 34,
    riskScore: 'high',
    rate: '7.50%',
  },
]

function getRiskBadgeColor(risk: string) {
  switch (risk) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStageBadgeColor(stage: string) {
  switch (stage) {
    case 'Application':
      return 'bg-blue-100 text-blue-800'
    case 'Underwriting':
      return 'bg-yellow-100 text-yellow-800'
    case 'Approval Pending':
      return 'bg-purple-100 text-purple-800'
    case 'Due Diligence':
      return 'bg-orange-100 text-orange-800'
    case 'Docs/Closing':
      return 'bg-green-100 text-green-800'
    case 'On Hold':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function LoansTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrower
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LTV
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DSCR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockLoans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{loan.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{loan.borrower}</div>
                  <div className="text-sm text-gray-500">{loan.propertyType}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{loan.property}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{loan.loanAmount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{loan.loanType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900">{loan.ltv}%</span>
                    {loan.ltv > 75 ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : loan.ltv < 70 ? (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900">{loan.dscr}</span>
                    {loan.dscr < 1.25 ? (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    ) : loan.dscr > 1.4 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{loan.rate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageBadgeColor(loan.stage)}`}>
                    {loan.stage}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{loan.daysInStage}d</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeColor(loan.riskScore)}`}>
                    {loan.riskScore.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
            <span className="font-medium">127</span> loans
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
