'use client';

import { Calendar } from 'lucide-react';

interface GanttChartProps {
  projectId: string;
}

export function GanttChart({ projectId }: GanttChartProps) {
  // Mock data - will be replaced with real data
  const phases = [
    { name: 'Pre-Construction', start: 0, duration: 10, color: 'bg-blue-400', progress: 100 },
    { name: 'Site Work', start: 10, duration: 15, color: 'bg-purple-400', progress: 100 },
    { name: 'Foundation', start: 25, duration: 20, color: 'bg-green-400', progress: 100 },
    { name: 'Structural', start: 45, duration: 30, color: 'bg-yellow-400', progress: 60 },
    { name: 'MEP Rough-In', start: 75, duration: 25, color: 'bg-orange-400', progress: 0 },
    { name: 'Exterior Envelope', start: 100, duration: 40, color: 'bg-red-400', progress: 0 },
    { name: 'Interior Finishes', start: 140, duration: 35, color: 'bg-pink-400', progress: 0 },
    { name: 'Punch List & Close-Out', start: 175, duration: 10, color: 'bg-gray-400', progress: 0 }
  ];

  const totalDuration = 185;
  const currentDay = 63; // ~34% progress

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gray-900">Project Timeline</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>185 days total duration</span>
        </div>
      </div>

      <div className="space-y-3">
        {phases.map((phase, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{phase.name}</span>
              <span className="text-xs text-gray-500">{phase.duration} days</span>
            </div>
            <div className="relative h-8 bg-gray-50 rounded">
              {/* Phase bar */}
              <div 
                className={`absolute top-0 bottom-0 ${phase.color} opacity-30 rounded`}
                style={{
                  left: `${(phase.start / totalDuration) * 100}%`,
                  width: `${(phase.duration / totalDuration) * 100}%`
                }}
              />
              {/* Progress bar */}
              {phase.progress > 0 && (
                <div 
                  className={`absolute top-0 bottom-0 ${phase.color} rounded`}
                  style={{
                    left: `${(phase.start / totalDuration) * 100}%`,
                    width: `${((phase.duration * phase.progress) / 100 / totalDuration) * 100}%`
                  }}
                />
              )}
              {/* Current day marker */}
              {currentDay >= phase.start && currentDay <= phase.start + phase.duration && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-900"
                  style={{ left: `${(currentDay / totalDuration) * 100}%` }}
                />
              )}
            </div>
            {phase.progress > 0 && phase.progress < 100 && (
              <div className="text-xs text-gray-500 mt-1">
                {phase.progress}% complete
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline scale */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="relative h-8">
          <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500">
            <span>Jan '26</span>
            <span>Mar '26</span>
            <span>May '26</span>
            <span>Jul '26</span>
            <span>Sep '26</span>
          </div>
          {/* Current day marker */}
          <div 
            className="absolute top-6 w-0.5 h-2 bg-gray-900"
            style={{ left: `${(currentDay / totalDuration) * 100}%` }}
          />
          <div 
            className="absolute top-9 text-xs font-medium text-gray-900 -translate-x-1/2"
            style={{ left: `${(currentDay / totalDuration) * 100}%` }}
          >
            Today
          </div>
        </div>
      </div>
    </div>
  );
}