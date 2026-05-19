'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface EntitlementTimelineProps {
  parcel: {
    id: string;
  };
}

export default function EntitlementTimeline({ parcel }: EntitlementTimelineProps) {
  const milestones = [
    { name: 'Pre-application meeting', status: 'complete', date: '2024-01-15' },
    { name: 'Formal application submitted', status: 'complete', date: '2024-02-01' },
    { name: 'Completeness review', status: 'complete', date: '2024-02-22' },
    { name: 'Staff review & comment period', status: 'active', date: 'Est. 2024-05-30' },
    { name: 'Planning commission hearing', status: 'pending', date: 'Est. 2024-07-15' },
    { name: 'City council approval', status: 'pending', date: 'Est. 2024-08-20' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-serif text-lg text-gray-900">Entitlement Timeline</h3>
        <p className="text-xs text-gray-500 mt-1">Current application progress</p>
      </div>

      <div className="p-4">
        <div className="space-y-1">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="flex items-start space-x-3 py-3">
              <div className="mt-0.5">
                {milestone.status === 'complete' && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
                {milestone.status === 'active' && (
                  <Clock className="w-5 h-5 text-[#F9D96A]" />
                )}
                {milestone.status === 'pending' && (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  milestone.status === 'complete' ? 'text-gray-900' :
                  milestone.status === 'active' ? 'text-gray-900' :
                  'text-gray-400'
                }`}>
                  {milestone.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{milestone.date}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-blue-900 mb-1">Next Action Required</div>
          <div className="text-xs text-blue-700">
            Respond to staff comments by June 7, 2024
          </div>
        </div>
      </div>
    </div>
  );
}