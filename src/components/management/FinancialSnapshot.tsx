'use client'

import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface FinancialSnapshotProps {
  propertyId: string
}

export default function FinancialSnapshot({ propertyId }: FinancialSnapshotProps) {
  // Mock data - will be replaced with real data from Supabase
  const financial = {
    revenue: {
      rental: 1234560,
      other: 45800,
      total: 1280360
    },
    expenses: {
      operating: 342100,
      maintenance: 87650,
      utilities: 54320,
      insurance: 32100,
      taxes: 98400,
      total: 614570
    },
    noi: 665790,
    cashFlow: 534210,
    variance: {
      revenue: 8.3,
      expenses: -2.1,
      noi: 12.4
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const VarianceBadge = ({ value }: { value: number }) => (
    <span className={`flex items-center text-sm font-medium ${
      value > 0 ? 'text-green-600' : 'text-red-600'
    }`}>
      {value > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
      {value > 0 ? '+' : ''}{value}% vs budget
    </span>
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gray-900">Financial Snapshot (TTM)</h2>
        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
          View Full P&L →
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Revenue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Revenue</h3>
            <VarianceBadge value={financial.variance.revenue} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rental Income</span>
              <span className="font-medium text-gray-900">{formatCurrency(financial.revenue.rental)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Other Income</span>
              <span className="font-medium text-gray-900">{formatCurrency(financial.revenue.other)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total Revenue</span>
              <span className="font-semibold text-gray-900">{formatCurrency(financial.revenue.total)}</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Operating Expenses</h3>
            <VarianceBadge value={financial.variance.expenses} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Operating Expenses</span>
              <span className="font-medium text-gray-900">{formatCurrency(financial.expenses.operating)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Maintenance & Repairs</span>
              <span className="font-medium text-gray-900">{formatCurrency(financial.expenses.maintenance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Utilities</span>
              <span className="font-medium text-gray-900">{formatCurrency(financial.expenses.utilities)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Insurance</span>
              <span className="font-medium text-gray-900">{formatCurrency(financial.expenses.insurance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Property Taxes</span>
              <span className="font-medium text-gray-900">{formatCurrency(financial.expenses.taxes)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total Expenses</span>
              <span className="font-semibold text-gray-900">{formatCurrency(financial.expenses.total)}</span>
            </div>
          </div>
        </div>

        {/* NOI & Cash Flow */}
        <div className="pt-4 border-t-2 border-gray-300 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-900 text-lg">Net Operating Income</div>
              <VarianceBadge value={financial.variance.noi} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(financial.noi)}</div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <div className="font-semibold text-gray-900">Cash Flow (after debt service)</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(financial.cashFlow)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
