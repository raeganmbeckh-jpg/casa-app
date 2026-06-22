'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QISScoreCardProps {
  propertyId: string;
}

export default function QISScoreCard({ propertyId }: QISScoreCardProps) {
  // Mock data - will be replaced with actual agent consensus
  const qisScore = 78;
  const previousScore = 72;
  const trend = qisScore - previousScore;
  const confidence = 87;
  const agentConsensus = 'Strong Buy';
  
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="text-sm font-medium text-gray-600 mb-2">Quantum Intelligence Score</div>
          <div className="flex items-end gap-4">
            <div className="text-7xl font-['Cormorant_Garamond'] font-semibold text-gray-900">
              {qisScore}
            </div>
            <div className="mb-4">
              <div className={`flex items-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {Math.abs(trend)}
                </span>
              </div>
              <div className="text-xs text-gray-500">vs. last period</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#F9D96A] transition-all duration-500"
              style={{ width: `${qisScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Poor (0)</span>
            <span>Excellent (100)</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Agent Consensus</div>
            <div className="text-2xl font-semibold text-gray-900">{agentConsensus}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600 mb-1">Confidence Level</div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold text-gray-900">{confidence}%</div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-600">Score Components</div>
          <div className="space-y-3">
            {[
              { label: 'Market Position', value: 82 },
              { label: 'Financial Health', value: 78 },
              { label: 'Risk Profile', value: 75 },
              { label: 'Growth Potential', value: 76 }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F9D96A] transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}