import React from 'react'

interface AgentRecommendationsProps {
  parcelId: string
}

const agents = [
  {
    name: 'Zoning Analyst',
    recommendation: 'Pursue MU-2 rezoning',
    confidence: 85,
    reasoning: 'Strong precedent in adjacent parcels. City comprehensive plan supports mixed-use in this corridor. Traffic study results within acceptable thresholds.',
    vote: 'approve'
  },
  {
    name: 'Financial Modeler',
    recommendation: 'Multifamily development optimal',
    confidence: 92,
    reasoning: 'Highest risk-adjusted return among scenarios. Rental comps support $2.15/SF pricing. Construction costs align with recent projects.',
    vote: 'approve'
  },
  {
    name: 'Market Analyst',
    recommendation: 'Proceed with caution on timing',
    confidence: 68,
    reasoning: 'Current absorption rate strong but 840 units in pipeline within 2-mile radius. Recommend phased delivery to match absorption.',
    vote: 'approve_conditional'
  },
  {
    name: 'Environmental Risk',
    recommendation: 'Phase I ESA required',
    confidence: 78,
    reasoning: 'Historical aerial shows potential former commercial use. No known contamination but Phase I recommended before acquisition.',
    vote: 'approve_conditional'
  },
  {
    name: 'Construction Feasibility',
    recommendation: 'Site suitable with standard prep',
    confidence: 88,
    reasoning: 'Topography favorable. Utilities at property line. Soils report shows no unusual foundation requirements. Standard site work budget appropriate.',
    vote: 'approve'
  }
]

export default function AgentRecommendations({ parcelId }: AgentRecommendationsProps) {
  const avgConfidence = Math.round(
    agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length
  )
  
  const approveCount = agents.filter(a => a.vote === 'approve').length
  const conditionalCount = agents.filter(a => a.vote === 'approve_conditional').length
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cormorant text-2xl font-light text-gray-900">
              Agent Consensus Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Multi-agent recommendation summary
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{avgConfidence}%</div>
            <div className="text-xs text-gray-500">Avg. Confidence</div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Consensus summary */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-green-900 mb-2">
                Strong Consensus: Proceed with Development
              </div>
              <div className="text-sm text-green-800">
                {approveCount} of {agents.length} agents recommend proceeding.
                {conditionalCount > 0 && ` ${conditionalCount} recommend proceeding with conditions.`}
                {' '}Overall confidence level: {avgConfidence}%.
              </div>
            </div>
          </div>
        </div>
        
        {/* Individual agent analyses */}
        <div className="space-y-4">
          {agents.map((agent, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{agent.name}</div>
                    <div className="text-sm text-gray-600">{agent.recommendation}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{agent.confidence}%</div>
                    <div className="text-xs text-gray-500">confidence</div>
                  </div>
                  {agent.vote === 'approve' ? (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {agent.reasoning}
              </p>
            </div>
          ))}
        </div>
        
        {/* Final recommendation */}
        <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="font-medium text-gray-900 mb-2">Final Recommendation</div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Proceed with land acquisition and pursue MU-2 rezoning for 48-unit multifamily development. 
            Complete Phase I Environmental Site Assessment during due diligence period. Maintain conservative 
            absorption assumptions given competitive pipeline. Expected risk-adjusted IRR of 16.2-18.8%.
          </p>
          
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Generate Full Report
            </button>
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Export to Underwriting
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}