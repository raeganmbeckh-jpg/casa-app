'use client';

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface AgentScoresProps {
  propertyId: string;
}

interface AgentScore {
  name: string;
  role: string;
  score: number;
  recommendation: 'buy' | 'hold' | 'pass';
  reasoning: string;
  confidence: number;
}

export default function AgentScores({ propertyId }: AgentScoresProps) {
  // Mock data - will be replaced with actual agent outputs
  const agents: AgentScore[] = [
    {
      name: 'Underwriter Alpha',
      role: 'Financial Analysis',
      score: 82,
      recommendation: 'buy',
      reasoning: 'Strong NOI growth trajectory with conservative debt coverage',
      confidence: 91
    },
    {
      name: 'Comp Analyst',
      role: 'Market Comparables',
      score: 76,
      recommendation: 'buy',
      reasoning: 'Trading at 8% discount to comparable assets in submarket',
      confidence: 85
    },
    {
      name: 'Risk Modeler',
      role: 'Risk Assessment',
      score: 71,
      recommendation: 'hold',
      reasoning: 'Elevated tenant concentration risk (top 3 = 45% of NOI)',
      confidence: 88
    },
    {
      name: 'Exit Strategist',
      role: 'Disposition Planning',
      score: 79,
      recommendation: 'buy',
      reasoning: 'Strong buyer demand in market, optimal 5-7 year hold period',
      confidence: 82
    },
    {
      name: 'Capital Stack Architect',
      role: 'Financing Structure',
      score: 84,
      recommendation: 'buy',
      reasoning: 'Favorable debt terms available, 65% LTV achievable at 5.5%',
      confidence: 90
    }
  ];

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'buy': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'hold': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'pass': return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getRecommendationBadge = (rec: string) => {
    const colors = {
      buy: 'bg-green-100 text-green-800',
      hold: 'bg-yellow-100 text-yellow-800',
      pass: 'bg-red-100 text-red-800'
    };
    return colors[rec as keyof typeof colors];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-gray-900">
          Agent Scores
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Individual agent analysis and recommendations
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {agents.map((agent) => (
          <div key={agent.name} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                  {getRecommendationIcon(agent.recommendation)}
                </div>
                <p className="text-sm text-gray-600">{agent.role}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-900">{agent.score}</div>
                <div className="text-xs text-gray-500">{agent.confidence}% confident</div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#F9D96A] transition-all duration-500"
                  style={{ width: `${agent.score}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRecommendationBadge(agent.recommendation)}`}>
                {agent.recommendation.toUpperCase()}
              </span>
              <p className="text-sm text-gray-700 flex-1">{agent.reasoning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}