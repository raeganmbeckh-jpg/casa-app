'use client'

interface StageCardProps {
  stage: string
  count: number
  volume: string
  color: string
}

function StageCard({ stage, count, volume, color }: StageCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <div className="text-2xl font-bold text-gray-900">{count}</div>
      </div>
      <div className="text-sm font-medium text-gray-900 mb-1">{stage}</div>
      <div className="text-sm text-gray-600">{volume}</div>
    </div>
  )
}

export function LoanStageOverview() {
  const stages = [
    { stage: 'Application', count: 34, volume: '$78.2M', color: 'bg-blue-500' },
    { stage: 'Underwriting', count: 28, volume: '$64.5M', color: 'bg-[#F9D96A]' },
    { stage: 'Approval Pending', count: 19, volume: '$42.8M', color: 'bg-purple-500' },
    { stage: 'Due Diligence', count: 23, volume: '$53.6M', color: 'bg-orange-500' },
    { stage: 'Docs/Closing', count: 15, volume: '$32.9M', color: 'bg-green-500' },
    { stage: 'On Hold', count: 8, volume: '$12.3M', color: 'bg-gray-400' },
  ]

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-gray-900 mb-6">
        Pipeline by Stage
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <StageCard key={stage.stage} {...stage} />
        ))}
      </div>
    </div>
  )
}
