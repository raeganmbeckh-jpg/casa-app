'use client'

import { TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react'

const metrics = [
  {
    label: 'Active Projects',
    value: '12',
    change: '+2 from last month',
    trend: 'up',
    icon: Calendar,
  },
  {
    label: 'Total Development Value',
    value: '$847M',
    change: '+$124M this quarter',
    trend: 'up',
    icon: DollarSign,
  },
  {
    label: 'Avg. ROI',
    value: '18.4%',
    change: '+2.1% vs. forecast',
    trend: 'up',
    icon: TrendingUp,
  },
  {
    label: 'At-Risk Projects',
    value: '3',
    change: '2 over budget, 1 delayed',
    trend: 'neutral',
    icon: AlertCircle,
  },
]

export function PipelineMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.label}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-[#F9D96A]/10 rounded-lg">
                <Icon className="w-5 h-5 text-[#F9D96A]" />
              </div>
              {metric.trend === 'up' && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  ↑
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-['Inter']">{metric.label}</p>
              <p className="text-3xl font-semibold text-gray-900 font-['Cormorant_Garamond']">
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 font-['Inter']">{metric.change}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
