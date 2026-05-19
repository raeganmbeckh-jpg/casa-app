'use client';

import { Check, X, AlertCircle } from 'lucide-react';

interface PermittedUsesProps {
  zoning: string;
}

export default function PermittedUses({ zoning }: PermittedUsesProps) {
  const uses = {
    permitted: [
      { name: 'Single-family detached dwelling', notes: 'By right' },
      { name: 'Accessory dwelling unit (ADU)', notes: 'Max 800 sq ft' },
      { name: 'Home occupation', notes: 'No external signage' },
      { name: 'Agricultural uses', notes: 'Hobby farming only' },
      { name: 'Private garage', notes: 'Max 3 vehicles' }
    ],
    conditional: [
      { name: 'Two-family dwelling', notes: 'Requires special permit', probability: 65 },
      { name: 'Bed & breakfast', notes: 'Max 4 guest rooms', probability: 45 },
      { name: 'Day care (home)', notes: 'Max 6 children', probability: 75 },
      { name: 'Religious facility', notes: 'Traffic study required', probability: 55 }
    ],
    prohibited: [
      { name: 'Multi-family (3+ units)', reason: 'Density exceeds zoning' },
      { name: 'Commercial retail', reason: 'Residential zone' },
      { name: 'Industrial uses', reason: 'Residential zone' },
      { name: 'Short-term rental', reason: 'Local ordinance restriction' }
    ]
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-6">
        <h2 className="font-serif text-2xl text-gray-900">Permitted Uses</h2>
        <p className="text-sm text-gray-500 mt-1">What can be built under current zoning</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Permitted By Right */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900">Permitted By Right</h3>
          </div>
          <div className="space-y-2">
            {uses.permitted.map((use, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50/50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{use.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{use.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Uses */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900">Conditional / Special Permit Required</h3>
          </div>
          <div className="space-y-2">
            {uses.conditional.map((use, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-amber-50/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{use.name}</div>
                    <div className="text-xs font-semibold text-amber-700">
                      {use.probability}% approval probability
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{use.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prohibited Uses */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900">Prohibited Uses</h3>
          </div>
          <div className="space-y-2">
            {uses.prohibited.map((use, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-red-50/50 rounded-lg">
                <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{use.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{use.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}