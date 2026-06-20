'use client';

import { useState } from 'react';

type Stage = 'evaluation' | 'underwriting' | 'contract' | 'due-diligence' | 'closed';

export default function DealStageOverview() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const stages = [
    { id: 'evaluation' as Stage, label: 'Evaluation', count: 12, value: '$18.5M' },
    { id: 'underwriting' as Stage, label: 'Underwriting', count: 7, value: '$12.3M' },
    { id: 'contract' as Stage, label: 'Under Contract', count: 8, value: '$14.8M' },
    { id: 'due-diligence' as Stage, label: 'Due Diligence', count: 4, value: '$8.2M' },
    { id: 'closed' as Stage, label: 'Closed (30d)', count: 3, value: '$6.1M' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-heading text-xl font-bold text-gray-900">
        Pipeline by Stage
      </h2>
      <div className="mt-6 grid grid-cols-5 gap-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="relative">
            <button
              onClick={() =>
                setSelectedStage(
                  selectedStage === stage.id ? null : stage.id
                )
              }
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                selectedStage === stage.id
                  ? 'border-[#F9D96A] bg-[#FEF9E7]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-600">
                {stage.label}
              </p>
              <p className="mt-2 font-heading text-3xl font-bold text-gray-900">
                {stage.count}
              </p>
              <p className="mt-1 text-sm text-gray-600">{stage.value}</p>
            </button>
            {index < stages.length - 1 && (
              <div className="absolute right-0 top-1/2 h-0.5 w-4 -translate-y-1/2 translate-x-full bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
