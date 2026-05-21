interface AgentRiskAssessmentProps {
  loanData: {
    loanAmount: number;
    propertyValue: number;
    noi: number;
    propertyType: string;
  };
}

export default function AgentRiskAssessment({ loanData }: AgentRiskAssessmentProps) {
  const agents = [
    {
      name: 'Credit Analyst',
      avatar: 'CA',
      color: 'bg-blue-100 text-blue-700',
      recommendation: 'APPROVE',
      confidence: 87,
      reasoning: 'Strong DSCR of 1.43x and conservative LTV of 71.4% provide adequate cushion. Borrower credit profile is solid with no recent delinquencies.'
    },
    {
      name: 'Collateral Evaluator',
      avatar: 'CE',
      color: 'bg-green-100 text-green-700',
      recommendation: 'APPROVE',
      confidence: 92,
      reasoning: 'Property is well-located in growing submarket. Recent comparable sales support appraised value. Physical condition is good per inspection report.'
    },
    {
      name: 'Stress Tester',
      avatar: 'ST',
      color: 'bg-amber-100 text-amber-700',
      recommendation: 'APPROVE WITH CONDITIONS',
      confidence: 78,
      reasoning: 'Loan passes most stress scenarios but combined stress (NOI -10%, Rate +1%, Value -15%) brings DSCR to 1.09x. Recommend covenant for minimum 1.15x DSCR.'
    },
    {
      name: 'Market Risk Agent',
      avatar: 'MR',
      color: 'bg-purple-100 text-purple-700',
      recommendation: 'APPROVE',
      confidence: 84,
      reasoning: 'Austin multifamily market remains strong with low vacancy and rent growth. Interest rate environment is stabilizing. Property type and location align with positive fundamentals.'
    }
  ];

  const consensusScore = agents.reduce((sum, agent) => sum + agent.confidence, 0) / agents.length;
  const approveCount = agents.filter(a => a.recommendation.includes('APPROVE')).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-cormorant text-xl font-semibold text-gray-900 mb-1">
            Agent Risk Assessment
          </h3>
          <p className="text-sm text-gray-500">
            {approveCount}/{agents.length} agents recommend approval • {consensusScore.toFixed(0)}% consensus confidence
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 mb-1">Consensus Score</div>
          <div className="text-3xl font-semibold text-green-600">{consensusScore.toFixed(0)}</div>
        </div>
      </div>

      <div className="space-y-4">
        {agents.map((agent, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full ${agent.color} flex items-center justify-center font-semibold flex-shrink-0`}>
                {agent.avatar}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-500">Confidence: {agent.confidence}%</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    agent.recommendation === 'APPROVE' ? 'bg-green-100 text-green-700' :
                    agent.recommendation === 'APPROVE WITH CONDITIONS' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {agent.recommendation}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{agent.reasoning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">ℹ️</div>
            <div className="flex-1">
              <div className="font-medium text-blue-900 mb-1">Human Review Required</div>
              <p className="text-sm text-blue-700">
                While agent consensus is positive, final approval requires licensed loan officer review and sign-off per compliance requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}