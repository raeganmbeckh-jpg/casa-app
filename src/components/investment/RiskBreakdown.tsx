'use client';

import { AlertTriangle, TrendingDown, Users, MapPin, DollarSign } from 'lucide-react';

interface RiskBreakdownProps {
  propertyId: string;
}

interface RiskFactor {
  category: string;
  score: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  icon: React.ReactNode;
}

export default function RiskBreakdown({ propertyId }: RiskBreakdownProps) {
  const risks: RiskFactor[] = [
    {
      category: 'Market Risk',
      score: 35,
      severity: 'medium',
      description: 'Submarket showing signs of oversupply in class A office',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      category: 'Tenant Concentration',
      score: 52,
      severity: 'high',
      description: 'Top 3 tenants represent 45% of NOI, renewal risk in 18mo',
      icon: <Users className="w-5 h-5" />
    },
    {
      category: 'Interest Rate Exposure',
      score: 28,
      severity: 'low',
      description: 'Fixed-rate debt through 2029, minimal rate sensitivity',
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      category: 'Economic Downturn',
      score: 41,
      severity: 'medium',
      description: 'Asset class moderately cyclical, 15% downside in recession',
      icon: <TrendingDown className="w-5 h-5" />
    },
    {
      category: 'Regulatory Risk',
      score: 22,
      severity: 'low',
      description: 'Minimal exposure to zoning changes or new regulations',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
    }
  };

  const getBarColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
    }
  };

  const overallRisk = Math.round(risks.reduce((acc, r) => acc + r.score, 0) / risks.length);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-gray-900">
              Risk Breakdown
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Multi-dimensional risk assessment
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600 mb-1">Overall Risk</div>
            <div className="text-3xl font-semibold text-gray-900">{overallRisk}</div>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {risks.map((risk) => (
          <div key={risk.category}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(risk.severity)}`}>
                  {risk.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{risk.category}</h3>
                  <p className="text-sm text-gray-600">{risk.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-gray-900">{risk.score}</div>
                <div className="text-xs text-gray-500 uppercase">{risk.severity}</div>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getBarColor(risk.severity)} transition-all duration-500`}
                style={{ width: `${risk.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}