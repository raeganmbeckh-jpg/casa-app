import React from 'react'

interface UseCaseAnalysisProps {
  parcelId: string
}

const useCases = [
  {
    id: 1,
    name: 'Multifamily Development',
    score: 92,
    units: 48,
    density: '19.4 units/acre',
    roi: '18.2%',
    timeline: '24 months',
    confidence: 'High',
    pros: ['Strong rental demand', 'Favorable zoning', 'Transit access'],
    cons: ['Higher construction costs', 'Longer permitting']
  },
  {
    id: 2,
    name: 'Townhome Development',
    score: 87,
    units: 16,
    density: '6.5 units/acre',
    roi: '21.4%',
    timeline: '18 months',
    confidence: 'High',
    pros: ['Premium pricing', 'Faster absorption', 'Lower density'],
    cons: ['Smaller market', 'HOA requirements']
  },
  {
    id: 3,
    name: 'Mixed-Use Development',
    score: 78,
    units: '32 units + 8,000 SF retail',
    density: 'Mixed',
    roi: '16.8%',
    timeline: '30 months',
    confidence: 'Medium',
    pros: ['Diversified income', 'Community appeal', 'Tax incentives'],
    cons: ['Requires rezoning', 'Complex financing', 'Longer timeline']
  },
  {
    id: 4,
    name: 'Single-Family Subdivision',
    score: 71,
    units: 12,
    density: '4.9 units/acre',
    roi: '14.2%',
    timeline: '16 months',
    confidence: 'Medium',
    pros: ['Lower risk', 'Proven demand', 'Simpler execution'],
    cons: ['Lower density', 'Infrastructure costs', 'Market saturation']
  }
]

export default function UseCaseAnalysis({ parcelId }: UseCaseAnalysisProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-cormorant text-2xl font-light text-gray-900">
          Development Scenarios
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Ranked by financial viability and market fit
        </p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-[#F9D96A] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-900 font-medium">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-cormorant text-xl font-medium text-gray-900">
                      {useCase.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {useCase.units} • {useCase.density}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{useCase.score}</div>
                    <div className="text-xs text-gray-500">HBU Score</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#F9D96A]">{useCase.roi}</div>
                    <div className="text-xs text-gray-500">Est. ROI</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">{useCase.timeline}</div>
                    <div className="text-xs text-gray-500">Timeline</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Advantages</span>
                  </div>
                  <ul className="space-y-1">
                    {useCase.pros.map((pro, idx) => (
                      <li key={idx} className="text-sm text-gray-600 pl-6">
                        • {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Considerations</span>
                  </div>
                  <ul className="space-y-1">
                    {useCase.cons.map((con, idx) => (
                      <li key={idx} className="text-sm text-gray-600 pl-6">
                        • {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {useCase.confidence} Confidence
                </span>
                <button className="text-sm text-gray-900 hover:text-[#F9D96A] font-medium transition-colors">
                  View Full Analysis →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}