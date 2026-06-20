'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

interface PropertyMetricsProps {
  propertyId: string
}

export default function PropertyMetrics({ propertyId }: PropertyMetricsProps) {
  // Mock data - will be replaced with real data from Supabase
  const metrics = [
    { label: 'Occupancy Rate', value: '95.8%', change: '+2.1%', trend: 'up' },
    { label: 'Avg Rent/Unit', value: '$2,450', change: '+$125', trend: 'up' },
    { label: 'NOI (TTM)', value: '$847,200', change: '+8.3%', trend: 'up' },
    { label: 'Cap Rate', value: '6.8%', change: '-0.2%', trend: 'down' },
    { label: 'Collections Rate', value: '98.2%', change: '+0.5%', trend: 'up' },
    { label: 'Turnover Rate', value: '12.5%', change: '-3.2%', trend: 'up' }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-serif text-gray-900 mb-6">Key Performance Metrics</h2>
      
      <div className="grid grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="border-l-4 border-[#F9D96A] pl-4">
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
              <div className={`flex items-center text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
