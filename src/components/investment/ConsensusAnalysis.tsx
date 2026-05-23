'use client';

import { CheckCircle2, AlertCircle, XCircle, MessageSquare } from 'lucide-react';

interface ConsensusAnalysisProps {
  propertyId: string;
}

export default function ConsensusAnalysis({ propertyId }: ConsensusAnalysisProps) {
  const consensus = {
    agreement: 80,
    strongBuy: 3,
    buy: 2,
    hold: 1,
    pass: 0,
    total: 6
  };

  const debates = [
    {
      topic: 'Tenant Concentration Risk',
      agents: ['Risk Modeler', 'Underwriter Alpha'],
      positions: [
        'Risk Modeler: High concentration (45% in top 3) warrants hold recommendation',
        'Underwriter Alpha: Strong credit quality and staggered leases mitigate risk'
      ],
      resolution: 'Moderate concern flagged; recommend tenant diversification strategy in business plan'
    },
    {
      topic: 'Exit Timing',
      agents: ['Exit Strategist', 'Market Analyst'],
      positions: [
        'Exit Strategist: Optimal 5-7 year hold to maximize value appreciation',
        'Market Analyst: Current buyer demand strong, consider shorter 3-5 year hold'
      ],
      resolution: 'Flexible exit strategy with annual market reassessment recommended'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-gray-900">
          Consensus Analysis
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Agent agreement levels and key debates
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600 mb-4">Agreement Level</div>
            <div className="flex items-end gap-4 mb-4">
              <div className="text-5xl font-['Cormorant_Garamond'] font-semibold text-gray-900">
                {consensus.agreement}%
              </div>
              <div className="mb-2 text-sm text-gray-600">
                of agents in consensus
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#F9D96A] transition-all duration-500"
                style={{ width: `${consensus.agreement}%` }}
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600 mb-4">Recommendation Distribution</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Strong Buy</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{consensus.strongBuy}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">Buy</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{consensus.buy}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-700">Hold</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{consensus.hold}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-700">Pass</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{consensus.pass}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Key Debates</h3>
          </div>
          <div className="space-y-4">
            {debates.map((debate, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-2">{debate.topic}</div>
                <div className="text-sm text-gray-600 mb-3">
                  Between: {debate.agents.join(', ')}
                </div>
                <div className="space-y-2 mb-3">
                  {debate.positions.map((position, pidx) => (
                    <div key={pidx} className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                      {position}
                    </div>
                  ))}
                </div>
                <div className="bg-[#F9D96A] bg-opacity-20 border-l-4 border-[#F9D96A] p-3 rounded">
                  <div className="text-xs font-medium text-gray-600 mb-1">Resolution</div>
                  <div className="text-sm text-gray-900">{debate.resolution}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}