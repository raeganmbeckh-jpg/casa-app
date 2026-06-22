'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MarketPositioningProps {
  propertyId: string;
}

export default function MarketPositioning({ propertyId }: MarketPositioningProps) {
  const metrics = [
    {
      label: 'Price per SF',
      value: '$285',
      market: '$312',
      diff: -8.7,
      better: true
    },
    {
      label: 'Cap Rate',
      value: '6.2%',
      market: '5.8%',
      diff: 6.9,
      better: true
    },
    {
      label: 'Occupancy',
      value: '94%',
      market: '91%',
      diff: 3.3,
      better: true
    },
    {
      label: 'Rent Growth (3yr)',
      value: '4.2%',
      market: '3.8%',
      diff: 10.5,
      better: true
    },
    {
      label: 'Days on Market',
      value: '45',
      market: '62',
      diff: -27.4,
      better: true
    },
    {
      label: 'Price Trend (90d)',
      value: '+2.1%',
      market: '+1.5%',
      diff: 40.0,
      better: true
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-gray-900">
          Market Positioning
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          How this property compares to market averages
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.diff > 5 ? ArrowUp : metric.diff < -5 ? ArrowDown : Minus;
            const diffColor = metric.better
              ? metric.diff > 0 ? 'text-green-600' : 'text-red-600'
              : metric.diff > 0 ? 'text-red-600' : 'text-green-600';
            
            return (
              <div key={metric.label} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-3">{metric.label}</div>
                
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
                    <div className="text-xs text-gray-500 mt-1">This Property</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-gray-700">{metric.market}</div>
                    <div className="text-xs text-gray-500 mt-1">Market Avg</div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 ${diffColor}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {Math.abs(metric.diff).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-600">
                    {metric.better && metric.diff > 0 ? 'better' : metric.better && metric.diff < 0 ? 'worse' : 'vs market'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}