'use client';

import { TrendingUp, TrendingDown, DollarSign, Home, Clock, Users } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-['Inter'] text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 font-['Cormorant_Garamond'] text-3xl font-semibold text-gray-900">
            {value}
          </p>
          <div className="mt-2 flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`font-['Inter'] text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change}
            </span>
            <span className="font-['Inter'] text-sm text-gray-500">vs last month</span>
          </div>
        </div>
        <div className="rounded-full bg-[#F9D96A] bg-opacity-10 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function PipelineMetrics() {
  const metrics = [
    {
      title: 'Active Listings',
      value: '47',
      change: '+12%',
      trend: 'up' as const,
      icon: <Home className="h-6 w-6 text-[#F9D96A]" />,
    },
    {
      title: 'Total Volume',
      value: '$23.4M',
      change: '+18%',
      trend: 'up' as const,
      icon: <DollarSign className="h-6 w-6 text-[#F9D96A]" />,
    },
    {
      title: 'Avg Days on Market',
      value: '28',
      change: '-15%',
      trend: 'up' as const,
      icon: <Clock className="h-6 w-6 text-[#F9D96A]" />,
    },
    {
      title: 'Active Buyers',
      value: '143',
      change: '+8%',
      trend: 'up' as const,
      icon: <Users className="h-6 w-6 text-[#F9D96A]" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
