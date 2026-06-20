import { Users, CheckCircle2, AlertTriangle } from 'lucide-react'

const agentOpinions = [
  {
    agent: 'Pricing Strategist',
    recommendation: '$677,500',
    confidence: 92,
    rationale: 'Strong alignment with adjusted comps. Market velocity supports this price point.',
    consensus: true
  },
  {
    agent: 'Buyer Matcher',
    recommendation: '$675,000 - $680,000',
    confidence: 88,
    rationale: 'Active buyer pool of 14 qualified prospects in this range and area.',
    consensus: true
  },
  {
    agent: 'Velocity Forecaster',
    recommendation: '$670,000 (faster) or $685,000 (test)',
    confidence: 85,
    rationale: 'Lower price moves in 10 days. Higher price may sit 25+ days given inventory.',
    consensus: false
  }
]

export function AgentConsensus() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-700" />
        <h2 className="text-xl font-serif text-gray-900">Agent Consensus</h2>
      </div>

      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-900">Strong Consensus</span>
        </div>
        <p className="text-xs text-green-700">2 of 3 agents agree on $675k-$680k range</p>
      </div>

      <div className="space-y-3">
        {agentOpinions.map((opinion, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-medium text-gray-900">{opinion.agent}</div>
                <div className="text-xs text-gray-600 mt-0.5">{opinion.recommendation}</div>
              </div>
              <div className="flex items-center gap-1">
                {opinion.consensus ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-xs font-medium text-gray-600">{opinion.confidence}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{opinion.rationale}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg">
          View Full Agent Debate
        </button>
      </div>
    </div>
  )
}
