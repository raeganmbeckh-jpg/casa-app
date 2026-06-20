'use client';

import { useState } from 'react';

export default function CostInputs() {
  const [costs, setCosts] = useState({
    landAcquisition: 1500000,
    sitework: 450000,
    foundation: 380000,
    structure: 2100000,
    exterior: 620000,
    interior: 1850000,
    mep: 980000,
    contingency: 1000000,
    architectural: 285000,
    engineering: 195000,
    permits: 145000,
    legal: 95000,
    financing: 320000,
    marketing: 180000,
    insurance: 125000,
  });

  const updateCost = (key: keyof typeof costs, value: string) => {
    const numValue = parseFloat(value.replace(/,/g, '')) || 0;
    setCosts({ ...costs, [key]: numValue });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-bold text-gray-900">Cost Inputs</h2>
        <button className="text-sm text-[#F9D96A] hover:text-[#f7d04a] font-medium">
          Import from Template
        </button>
      </div>

      <div className="space-y-6">
        {/* Hard Costs */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Hard Costs</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'landAcquisition', label: 'Land Acquisition' },
              { key: 'sitework', label: 'Sitework & Demo' },
              { key: 'foundation', label: 'Foundation' },
              { key: 'structure', label: 'Structure & Framing' },
              { key: 'exterior', label: 'Exterior Finishes' },
              { key: 'interior', label: 'Interior Finishes' },
              { key: 'mep', label: 'MEP Systems' },
              { key: 'contingency', label: 'Contingency (10%)' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={formatCurrency(costs[key as keyof typeof costs])}
                  onChange={(e) => updateCost(key as keyof typeof costs, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Soft Costs */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Soft Costs</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'architectural', label: 'Architectural Fees' },
              { key: 'engineering', label: 'Engineering' },
              { key: 'permits', label: 'Permits & Entitlements' },
              { key: 'legal', label: 'Legal Fees' },
              { key: 'financing', label: 'Financing Costs' },
              { key: 'marketing', label: 'Marketing & Leasing' },
              { key: 'insurance', label: 'Insurance' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={formatCurrency(costs[key as keyof typeof costs])}
                  onChange={(e) => updateCost(key as keyof typeof costs, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}