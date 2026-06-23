import React from 'react'

interface DevelopmentTimelineProps {
  parcelId: string
}

const phases = [
  {
    name: 'Rezoning & Entitlements',
    duration: '6-9 months',
    start: 0,
    end: 9,
    milestones: ['Application submit', 'Public hearing', 'Council approval'],
    status: 'pending'
  },
  {
    name: 'Design & Engineering',
    duration: '4-6 months',
    start: 6,
    end: 12,
    milestones: ['Schematic design', 'Construction docs', 'Engineer review'],
    status: 'pending'
  },
  {
    name: 'Permitting',
    duration: '3-5 months',
    start: 11,
    end: 16,
    milestones: ['Permit submission', 'Plan review', 'Permit issuance'],
    status: 'pending'
  },
  {
    name: 'Construction',
    duration: '14-18 months',
    start: 16,
    end: 34,
    milestones: ['Site work', 'Vertical construction', 'TCO received'],
    status: 'pending'
  },
  {
    name: 'Lease-up & Stabilization',
    duration: '6-12 months',
    start: 32,
    end: 44,
    milestones: ['Marketing launch', '50% occupied', '95% stabilized'],
    status: 'pending'
  }
]

export default function DevelopmentTimeline({ parcelId }: DevelopmentTimelineProps) {
  const totalMonths = 44
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cormorant text-2xl font-light text-gray-900">
              Development Timeline
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Estimated 44-month end-to-end schedule
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">3.7 years</div>
            <div className="text-xs text-gray-500">Total duration</div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Timeline visualization */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="flex-1 text-center">
                Q{(idx % 4) + 1}
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            {phases.map((phase, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-48 text-sm font-medium text-gray-900">
                    {phase.name}
                  </div>
                  <div className="text-xs text-gray-500">{phase.duration}</div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-48" />
                  <div className="flex-1 relative h-8 bg-gray-100 rounded">
                    <div
                      className="absolute h-full bg-[#F9D96A] rounded flex items-center justify-center"
                      style={{
                        left: `${(phase.start / totalMonths) * 100}%`,
                        width: `${((phase.end - phase.start) / totalMonths) * 100}%`
                      }}
                    >
                      <span className="text-xs font-medium text-gray-900">
                        {phase.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Key milestones */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Critical Milestones</h3>
          <div className="grid grid-cols-2 gap-4">
            {phases.slice(0, 4).map((phase, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {phase.name}
                </div>
                <ul className="space-y-1">
                  {phase.milestones.map((milestone, mIdx) => (
                    <li key={mIdx} className="text-xs text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Risk factors */}
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-900 mb-2">
                Schedule Risk Factors
              </div>
              <ul className="space-y-1 text-xs text-orange-800">
                <li>• Rezoning approval may extend 3-6 months if appealed</li>
                <li>• Permit review historically 2-4 weeks longer in this jurisdiction</li>
                <li>• Weather delays typical in Q1 construction (add 2-3 weeks)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}