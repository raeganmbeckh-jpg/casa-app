'use client'

const stages = [
  { name: 'Concept', count: 8, value: '$124M', color: 'bg-blue-500' },
  { name: 'Pre-Development', count: 5, value: '$287M', color: 'bg-purple-500' },
  { name: 'Permitting', count: 4, value: '$156M', color: 'bg-yellow-500' },
  { name: 'Under Construction', count: 7, value: '$412M', color: 'bg-orange-500' },
  { name: 'Lease-Up', count: 3, value: '$98M', color: 'bg-green-500' },
  { name: 'Stabilized', count: 2, value: '$67M', color: 'bg-emerald-500' },
]

export function ProjectStageOverview() {
  const total = stages.reduce((sum, stage) => sum + stage.count, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-gray-900 mb-6">
        Pipeline by Stage
      </h2>

      {/* Visual Pipeline */}
      <div className="mb-8">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {stages.map((stage) => {
            const width = (stage.count / total) * 100
            return (
              <div
                key={stage.name}
                className={`${stage.color} relative group cursor-pointer transition-all hover:opacity-80`}
                style={{ width: `${width}%` }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {stage.count}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stage Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <div key={stage.name} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stage.color}`} />
              <span className="text-sm font-medium text-gray-900 font-['Inter']">
                {stage.name}
              </span>
            </div>
            <div className="space-y-1 pl-5">
              <p className="text-lg font-semibold text-gray-900 font-['Cormorant_Garamond']">
                {stage.count}
              </p>
              <p className="text-xs text-gray-500 font-['Inter']">{stage.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
