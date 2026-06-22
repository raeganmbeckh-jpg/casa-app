'use client';

import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface RiskOverlayProps {
  projectId: string;
}

export function RiskOverlay({ projectId }: RiskOverlayProps) {
  // Mock data - will be replaced with real data
  const risks = [
    {
      category: 'Weather',
      severity: 'medium',
      impact: 'Structural steel erection delayed 5-7 days',
      probability: 40,
      mitigation: 'Accelerate roof enclosure',
      trend: 'increasing'
    },
    {
      category: 'Permit',
      severity: 'high',
      impact: 'MEP rough-in cannot start on schedule',
      probability: 65,
      mitigation: 'Expedited review requested',
      trend: 'stable'
    },
    {
      category: 'Material',
      severity: 'low',
      impact: 'Window delivery delayed 2 weeks',
      probability: 25,
      mitigation: 'Alternative supplier identified',
      trend: 'decreasing'
    },
    {
      category: 'Labor',
      severity: 'medium',
      impact: 'Drywall crew availability tight',
      probability: 35,
      mitigation: 'Pre-book with backup contractor',
      trend: 'stable'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gray-900">Schedule Risk Analysis</h2>
        <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
          <AlertTriangle className="w-4 h-4" />
          4 Active Risks
        </div>
      </div>

      <div className="space-y-4">
        {risks.map((risk, index) => (
          <div 
            key={index} 
            className={`border-l-4 pl-4 ${
              risk.severity === 'high' ? 'border-red-400' :
              risk.severity === 'medium' ? 'border-yellow-400' :
              'border-blue-400'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{risk.category}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    risk.severity === 'high' ? 'bg-red-50 text-red-700' :
                    risk.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {risk.severity}
                  </span>
                  {risk.trend === 'increasing' && (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  )}
                  {risk.trend === 'decreasing' && (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">{risk.impact}</p>
                <p className="text-sm text-gray-600">Mitigation: {risk.mitigation}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{risk.probability}%</div>
                <div className="text-xs text-gray-500">probability</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Agent Consensus:</span> Overall schedule confidence 72%. 
          Focus on permit acceleration and weather-sensitive activities.
        </div>
      </div>
    </div>
  );
}