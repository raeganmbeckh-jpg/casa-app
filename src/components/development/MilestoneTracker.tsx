'use client';

import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface MilestoneTrackerProps {
  projectId: string;
}

export function MilestoneTracker({ projectId }: MilestoneTrackerProps) {
  // Mock data - will be replaced with real data
  const milestones = [
    {
      name: 'Site Mobilization',
      date: '2026-01-15',
      status: 'completed',
      variance: 0
    },
    {
      name: 'Foundation Complete',
      date: '2026-03-01',
      status: 'completed',
      variance: -2
    },
    {
      name: 'Structural Steel Complete',
      date: '2026-04-15',
      status: 'at-risk',
      variance: -7
    },
    {
      name: 'Building Dried-In',
      date: '2026-07-30',
      status: 'upcoming',
      variance: 0
    },
    {
      name: 'MEP Rough-In Complete',
      date: '2026-08-15',
      status: 'upcoming',
      variance: 0
    },
    {
      name: 'Certificate of Occupancy',
      date: '2027-01-30',
      status: 'upcoming',
      variance: 0
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-serif text-gray-900 mb-6">Major Milestones</h2>

      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-1">
              {milestone.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              {milestone.status === 'at-risk' && (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              {milestone.status === 'upcoming' && (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-1">
                {milestone.name}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {new Date(milestone.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              {milestone.variance !== 0 && (
                <div className={`text-xs font-medium ${
                  milestone.variance > 0 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {milestone.variance > 0 ? '+' : ''}{milestone.variance} days
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Milestones Complete</span>
          <span className="font-semibold text-gray-900">2 of 6</span>
        </div>
      </div>
    </div>
  );
}