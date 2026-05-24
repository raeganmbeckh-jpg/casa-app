'use client';

import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface CriticalPathProps {
  projectId: string;
}

export function CriticalPath({ projectId }: CriticalPathProps) {
  // Mock data - will be replaced with real data
  const criticalTasks = [
    {
      id: 1,
      name: 'Foundation Pour - Building A',
      status: 'completed',
      startDate: '2026-02-01',
      endDate: '2026-02-15',
      duration: 14,
      slack: 0,
      blockers: []
    },
    {
      id: 2,
      name: 'Structural Steel Erection',
      status: 'in-progress',
      startDate: '2026-02-16',
      endDate: '2026-03-30',
      duration: 42,
      slack: 0,
      blockers: ['Weather delay risk: 40%']
    },
    {
      id: 3,
      name: 'MEP Rough-In',
      status: 'upcoming',
      startDate: '2026-04-01',
      endDate: '2026-05-15',
      duration: 44,
      slack: 0,
      blockers: ['Pending electrical permit approval']
    },
    {
      id: 4,
      name: 'Exterior Envelope',
      status: 'upcoming',
      startDate: '2026-05-16',
      endDate: '2026-07-30',
      duration: 75,
      slack: 0,
      blockers: ['Material delivery: 3-week lead time']
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gray-900">Critical Path</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>0 days total float</span>
        </div>
      </div>

      <div className="space-y-4">
        {criticalTasks.map((task, index) => (
          <div key={task.id} className="relative">
            {index < criticalTasks.length - 1 && (
              <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}
            
            <div className="flex items-start gap-4">
              <div className="relative z-10">
                {task.status === 'completed' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}
                {task.status === 'in-progress' && (
                  <div className="w-8 h-8 rounded-full bg-[#F9D96A] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-900" />
                  </div>
                )}
                {task.status === 'upcoming' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>
                        {new Date(task.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                        {' → '}
                        {new Date(task.endDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span>•</span>
                      <span>{task.duration} days</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-50 text-green-700' :
                    task.status === 'in-progress' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {task.status === 'completed' ? 'Complete' :
                     task.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                  </span>
                </div>

                {task.blockers.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {task.blockers.map((blocker, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded">
                        <AlertCircle className="w-4 h-4" />
                        {blocker}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Critical Path Duration</span>
          <span className="font-semibold text-gray-900">175 days</span>
        </div>
      </div>
    </div>
  );
}