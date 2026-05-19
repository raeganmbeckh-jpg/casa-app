'use client';

import { TrendingUp, AlertTriangle, DollarSign, Clock } from 'lucide-react';

interface RezoningPotentialProps {
  parcel: {
    currentZoning: string;
    jurisdiction: string;
  };
}

export default function RezoningPotential({ parcel }: RezoningPotentialProps) {
  const scenarios = [
    {
      targetZoning: 'R-2 Two-Family Residential',
      probability: 72,
      timeframe: '8-12 months',
      cost: '$25,000 - $45,000',
      upside: '+$280,000 land value',
      reasoning: 'Adjacent parcels recently rezoned. City comprehensive plan supports density increase in this corridor.',
      risks: ['Neighbor opposition (moderate)', 'Traffic study required']
    },
    {
      targetZoning: 'R-3 Multi-Family Residential',
      probability: 38,
      timeframe: '12-18 months',
      cost: '$60,000 - $100,000',
      upside: '+$620,000 land value',
      reasoning: 'Requires variance for increased density. Historic overlay complicates approval.',
      risks: ['Historic commission review', 'Strong neighborhood opposition', 'Infrastructure capacity concerns']
    },
    {
      targetZoning: 'MU-1 Mixed Use',
      probability: 15,
      timeframe: '18-24 months',
      cost: '$100,000 - $180,000',
      upside: '+$1,200,000 land value',
      reasoning: 'Significant upzoning. Would require comprehensive plan amendment and likely PUD process.',
      risks: ['Not aligned with comp plan', 'Major infrastructure upgrades', 'Highly uncertain outcome']
    }
  ];

  const getProbabilityColor = (prob: number) => {
    if (prob >= 60) return 'bg-green-100 text-green-800 border-green-200';
    if (prob >= 30) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-gray-900">Rezoning Potential</h2>
            <p className="text-sm text-gray-500 mt-1">Agent-scored scenarios with probability and economics</p>
          </div>
          <div className="px-4 py-2 bg-[#F9D96A]/10 border border-[#F9D96A] rounded-lg text-center">
            <div className="text-xs text-gray-500">Agent Consensus</div>
            <div className="text-lg font-semibold text-gray-900">72% High Feasibility</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-5 space-y-4 hover:border-[#F9D96A] transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-gray-900">{scenario.targetZoning}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded border ${getProbabilityColor(scenario.probability)}`}>
                    {scenario.probability}% probability
                  </span>
                </div>
                <p className="text-sm text-gray-600">{scenario.reasoning}</p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Timeframe</span>
                </div>
                <div className="font-mono text-sm font-semibold text-gray-900">{scenario.timeframe}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Est. Cost</span>
                </div>
                <div className="font-mono text-sm font-semibold text-gray-900">{scenario.cost}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Value Upside</span>
                </div>
                <div className="font-mono text-sm font-semibold text-green-900">{scenario.upside}</div>
              </div>
            </div>

            {/* Risks */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Key Risks</span>
              </div>
              <div className="space-y-1">
                {scenario.risks.map((risk, riskIdx) => (
                  <div key={riskIdx} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}