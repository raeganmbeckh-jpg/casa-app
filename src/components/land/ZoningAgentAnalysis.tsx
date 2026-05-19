'use client';

import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

interface ZoningAgentAnalysisProps {
  parcel: {
    id: string;
  };
}

export default function ZoningAgentAnalysis({ parcel }: ZoningAgentAnalysisProps) {
  const agentCommentary = [
    {
      agent: 'Zoning Analyst',
      icon: Brain,
      sentiment: 'positive',
      summary: 'Strong rezoning potential to R-2. Adjacent corridor has seen 4 successful applications in past 18 months.',
      confidence: 85
    },
    {
      agent: 'HBU Modeler',
      icon: TrendingUp,
      sentiment: 'positive',
      summary: 'Current R-1 underutilizes site. R-2 doubles theoretical unit capacity from 1 to 2 units, unlocking significant value.',
      confidence: 78
    },
    {
      agent: 'Environmental Risk',
      icon: AlertTriangle,
      sentiment: 'caution',
      summary: 'Historic overlay adds approval complexity. Recommend architectural compatibility study before application.',
      confidence: 72
    }
  ];

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'border-green-200 bg-green-50';
    if (sentiment === 'caution') return 'border-amber-200 bg-amber-50';
    return 'border-red-200 bg-red-50';
  };

  const getSentimentDot = (sentiment: string) => {
    if (sentiment === 'positive') return 'bg-green-500';
    if (sentiment === 'caution') return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-serif text-lg text-gray-900">Agent Analysis</h3>
        <p className="text-xs text-gray-500 mt-1">Multi-agent consensus view</p>
      </div>

      <div className="p-4 space-y-3">
        {agentCommentary.map((comment, idx) => (
          <div key={idx} className={`p-4 rounded-lg border ${getSentimentColor(comment.sentiment)}`}>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white rounded-lg">
                <comment.icon className="w-4 h-4 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getSentimentDot(comment.sentiment)}`}></div>
                    <span className="text-xs font-semibold text-gray-900">{comment.agent}</span>
                  </div>
                  <span className="text-xs text-gray-500">{comment.confidence}% confidence</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{comment.summary}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Overall Recommendation */}
        <div className="mt-4 p-4 bg-[#F9D96A]/10 border border-[#F9D96A] rounded-lg">
          <div className="text-xs font-semibold text-gray-900 mb-2">Consensus Recommendation</div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Proceed with R-2 rezoning application. Commission architectural compatibility study first to address historic overlay. Budget $35K for application costs and 10-month timeline.
          </p>
        </div>
      </div>
    </div>
  );
}