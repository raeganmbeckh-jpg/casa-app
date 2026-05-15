'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
}

function MetricCard({ label, value, change, changeLabel }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = () => {
    if (!change) return 'text-gray-600'
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && (
            <span className="text-sm text-gray-500 ml-1">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

export function PipelineMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Active Loans"
        value="127"
        change={8}
        changeLabel="vs last month"
      />
      <MetricCard
        label="Total Loan Volume"
        value="$284.3M"
        change={12}
        changeLabel="vs last month"
      />
      <MetricCard
        label="Avg DSCR"
        value="1.42"
        change={-3}
        changeLabel="vs last month"
      />
      <MetricCard
        label="Weighted Avg LTV"
        value="68.5%"
        change={1}
        changeLabel="vs last month"
      />
    </div>
  )
}
