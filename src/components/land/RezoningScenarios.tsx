import React from 'react'

interface RezoningScenariosProps {
  parcelId: string
}

const scenarios = [
  {
    from: 'R-3 Residential',
    to: 'MU-2 Mixed Use',
    probability: 'High (75%)',
    timeline: '6-9 months',
    cost: 45000,
    densityIncrease: '+40%',
    valueImpact: '+$2.8M',
    requirements: [
      'Traffic impact study',
      'Community meeting',
      'Site plan approval'
    ],
    status: 'Recommended'
  },
  {
    from: 'R-3 Residential',
    to: 'R-4 High Density',
    probability: 'Medium (55%)',
    timeline: '4-6 months',
    cost: 28000,
    densityIncrease: '+25%',
    valueImpact: '+$1.2M',
    requirements: [
      'Parking variance',
      'Neighborhood notice'
    ],
    status: 'Alternative'
  }
]

export default function RezoningScenarios({ parcelId }: RezoningScenariosProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-cormorant text-2xl font-light text-gray-900">
          Rezoning Analysis
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Upzoning opportunities and feasibility
        </p>
      </div>
      
      <div className="p-6 space-y-4">
        {scenarios.map((scenario, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-5 ${
              scenario.status === 'Recommended'
                ? 'border-[#F9D96A] bg-[#F9D96A]/5'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {scenario.from}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    {scenario.to}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {scenario.probability} success rate
                </div>
              </div>
              
              {scenario.status === 'Recommended' && (
                <span className="px-2 py-1 bg-[#F9D96A] text-gray-900 text-xs font-medium rounded">
                  Recommended
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Timeline</div>
                <div className="text-sm font-medium text-gray-900">{scenario.timeline}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Est. Cost</div>
                <div className="text-sm font-medium text-gray-900">
                  ${(scenario.cost / 1000).toFixed(0)}K
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Density Increase</div>
                <div className="text-sm font-medium text-green-600">{scenario.densityIncrease}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Value Impact</div>
                <div className="text-sm font-medium text-green-600">{scenario.valueImpact}</div>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-medium text-gray-900 mb-2">Requirements:</div>
              <ul className="space-y-1">
                {scenario.requirements.map((req, reqIdx) => (
                  <li key={reqIdx} className="text-xs text-gray-600 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-sm font-medium text-blue-900 mb-1">
                Agent Consensus
              </div>
              <div className="text-xs text-blue-800">
                4 of 5 agents recommend pursuing MU-2 rezoning. Estimated 75% approval probability based on similar applications in this jurisdiction. Expected to add $2.8M in project value.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}