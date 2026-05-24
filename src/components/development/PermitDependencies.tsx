'use client';

import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface PermitDependenciesProps {
  projectId: string;
}

export function PermitDependencies({ projectId }: PermitDependenciesProps) {
  // Mock data - will be replaced with real data
  const permits = [
    {
      name: 'Building Permit',
      status: 'approved',
      submittedDate: '2025-12-01',
      approvedDate: '2026-01-10',
      blockedTasks: [],
      criticalPath: true
    },
    {
      name: 'Grading Permit',
      status: 'approved',
      submittedDate: '2025-12-15',
      approvedDate: '2026-01-20',
      blockedTasks: [],
      criticalPath: false
    },
    {
      name: 'Electrical Permit',
      status: 'pending',
      submittedDate: '2026-02-15',
      expectedDate: '2026-03-30',
      blockedTasks: ['MEP Rough-In', 'Panel Installation'],
      criticalPath: true,
      daysInReview: 23
    },
    {
      name: 'Mechanical Permit',
      status: 'pending',
      submittedDate: '2026-02-15',
      expectedDate: '2026-03-30',
      blockedTasks: ['HVAC Installation'],
      criticalPath: true,
      daysInReview: 23
    },
    {
      name: 'Plumbing Permit',
      status: 'under-review',
      submittedDate: '2026-02-20',
      expectedDate: '2026-04-05',
      blockedTasks: ['Plumbing Rough-In'],
      criticalPath: false,
      daysInReview: 18
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-serif text-gray-900 mb-6">Permit Dependencies</h2>

      <div className="space-y-4">
        {permits.map((permit, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 ${
              permit.status === 'pending' && permit.criticalPath ? 'border-yellow-200 bg-yellow-50' :
              permit.status === 'approved' ? 'border-green-200 bg-green-50' :
              'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {permit.status === 'approved' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {permit.status === 'pending' && (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                  {permit.status === 'under-review' && (
                    <FileText className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{permit.name}</span>
                    {permit.criticalPath && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded font-medium">
                        Critical Path
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Submitted: {new Date(permit.submittedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {permit.approvedDate && (
                    <div className="text-sm text-green-700">
                      Approved: {new Date(permit.approvedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                  {permit.expectedDate && !permit.approvedDate && (
                    <div className="text-sm text-gray-600">
                      Expected: {new Date(permit.expectedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
              {permit.daysInReview && (
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{permit.daysInReview}</div>
                  <div className="text-xs text-gray-500">days</div>
                </div>
              )}
            </div>

            {permit.blockedTasks.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-yellow-700 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Blocking {permit.blockedTasks.length} activities</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {permit.blockedTasks.map((task, i) => (
                    <span key={i} className="text-xs bg-white border border-yellow-200 text-gray-700 px-2 py-1 rounded">
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">Agent Alert:</span> Electrical and mechanical permits are on critical path. 
          Recommend expedited review request to avoid 2-week schedule slip.
        </div>
      </div>
    </div>
  );
}