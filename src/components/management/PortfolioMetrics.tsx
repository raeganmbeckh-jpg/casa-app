'use client';

import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down';
  positive: boolean;
}

// Mock data - will be replaced with real API call
const MOCK_METRICS: Metric[] = [
  {
    label: 'Total Units',
    value: '1,247',
    change: 2.3,
    changeLabel: 'vs last month',
    trend: 'up',
    positive: true,
  },
  {
    label: 'Occupancy Rate',
    value: '94.2%',
    change: 1.8,
    changeLabel: 'vs last month',
    trend: 'up',
    positive: true,
  },
  {
    label: 'Monthly NOI',
    value: '$487K',
    change: 5.4,
    changeLabel: 'vs last month',
    trend: 'up',
    positive: true,
  },
  {
    label: 'Active Issues',
    value: '23',
    change: -12.5,
    changeLabel: 'vs last month',
    trend: 'down',
    positive: true,
  },
];

export default function PortfolioMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {MOCK_METRICS.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const trendColor = metric.positive
    ? metric.trend === 'up'
      ? 'text-green-600'
      : 'text-red-600'
    : metric.trend === 'down'
    ? 'text-green-600'
    : 'text-red-600';

  const TrendIcon = metric.trend === 'up' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#F9D96A] transition-colors">
      <div className="text-sm font-medium text-gray-600 mb-2">
        {metric.label}
      </div>
      <div className="flex items-end justify-between">
        <div className="font-display text-3xl font-light text-gray-900">
          {metric.value}
        </div>
        <div className={`flex items-center text-sm font-medium ${trendColor}`}>
          <TrendIcon className="w-4 h-4 mr-1" />
          {Math.abs(metric.change)}%
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">{metric.changeLabel}</div>
    </div>
  );
}