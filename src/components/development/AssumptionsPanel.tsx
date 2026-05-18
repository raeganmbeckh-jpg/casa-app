'use client';

import { useState } from 'react';

export default function AssumptionsPanel() {
  const [assumptions, setAssumptions] = useState({
    constructionDuration: 18,
    selloutDuration: 12,
    absorptionRate: 85,
    contingencyRate: 10,
    costEscalation: 3.5,
    discountRate: 8.0,
    exitCapRate: 6.5,
  });

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-bold text-gray-900">Assumptions</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-[#F9D96A] hover:text-[#f7d04a] font-medium"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Construction Duration</label>
          {isEditing ? (
            <input
              type="number"
              value={assumptions.constructionDuration}
              onChange={(e) => setAssumptions({ ...assumptions, constructionDuration: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          ) : (
            <div className="text-lg font-medium text-gray-900">{assumptions.constructionDuration} months</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Sellout Duration</label>
          {isEditing ? (
            <input
              type="number"
              value={assumptions.selloutDuration}
              onChange={(e) => setAssumptions({ ...assumptions, selloutDuration: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          ) : (
            <div className="text-lg font-medium text-gray-900">{assumptions.selloutDuration} months</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Absorption Rate</label>
          {isEditing ? (
            <input
              type="number"
              value={assumptions.absorptionRate}
              onChange={(e) => setAssumptions({ ...assumptions, absorptionRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          ) : (
            <div className="text-lg font-medium text-gray-900">{assumptions.absorptionRate}%</div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm text-gray-600 mb-1">Contingency Rate</label>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={assumptions.contingencyRate}
              onChange={(e) => setAssumptions({ ...assumptions, contingencyRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          ) : (
            <div className="text-lg font-medium text-gray-900">{assumptions.contingencyRate}%</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Annual Cost Escalation</label>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={assumptions.costEscalation}
              onChange={(e) => setAssumptions({ ...assumptions, costEscalation: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          ) : (
            <div className="text-lg font-medium text-gray-900">{assumptions.costEscalation}%</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Discount Rate</label>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={assumptions.discountRate}
              onChange={(e) => setAssumptions({ ...assumptions, discountRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          ) : (
            <div className="text-lg font-medium text-gray-900">{assumptions.discountRate}%</div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Exit Cap Rate</label>
          {isEditing ? (
            <input
              type="number"
              step="0.1"
              value={assumptions.exitCapRate}
              onChange={(e) => setAssumptions({ ...assumptions, exitCapRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          ) : (
            <div className="text-lg font-medium text-gray-900">{assumptions.exitCapRate}%</div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
          Reset to Market Defaults
        </button>
      </div>
    </div>
  );
}