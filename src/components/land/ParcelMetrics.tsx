'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

const metrics: Metric[] = [
  {
    label: 'Parcels Tracked',
    value: '2,847',
    change: 12.5,
    changeLabel: 'vs last month',
  },
  {
    label: 'Avg Price/Acre',
    value: '$48,200',
    change: -3.2,
    changeLabel: 'vs last quarter',
  },
  {
    label: 'Available Parcels',
    value: '1,234',
    change: 8.1,
    changeLabel: 'new this week',
  },
  {
    label: 'Avg Days on Market',
    value: '87',
    change: -5.4,
    changeLabel: 'vs last month',
  },
];

export default function ParcelMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#F9D96A] transition-colors"
        >
          <div className="text-sm text-gray-600 font-['Inter'] mb-2">
            {metric.label}
          </div>
          <div className="text-3xl font-['Cormorant_Garamond'] font-light text-gray-900 mb-3">
            {metric.value}
          </div>
          <div className="flex items-center gap-2 text-sm font-['Inter']">
            {metric.change > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600">+{metric.change}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-600">{metric.change}%</span>
              </>
            )}
            <span className="text-gray-500">{metric.changeLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
