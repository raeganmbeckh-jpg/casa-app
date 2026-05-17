'use client';

import { useState } from 'react';

export default function AssumptionsPanel() {
  const [assumptions, setAssumptions] = useState({
    rentGrowth: 3.0,
    expenseGrowth: 2.5,
    exitCapRate: 7.5,
    sellingCosts: 2.0,
    capitalReserves: 300
  });

  const scenarios = [
    { name: 'Conservative', rentGrowth: 2.0, expenseGrowth: 3.5, exitCapRate: 8.0 },
    { name: 'Base Case', rentGrowth: 3.0, expenseGrowth: 2.5, exitCapRate: 7.5 },
    { name: 'Optimistic', rentGrowth: 4.0, expenseGrowth: 2.0, exitCapRate: 7.0 }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6">Assumptions</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Rent Growth
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={assumptions.rentGrowth}
                onChange={(e) => setAssumptions({ ...assumptions, rentGrowth: Number(e.target.value) })}
                className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Expense Growth
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={assumptions.expenseGrowth}
                onChange={(e) => setAssumptions({ ...assumptions, expenseGrowth: Number(e.target.value) })}
                className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exit Cap Rate
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={assumptions.exitCapRate}
                onChange={(e) => setAssumptions({ ...assumptions, exitCapRate: Number(e.target.value) })}
                className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Costs
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={assumptions.sellingCosts}
                onChange={(e) => setAssumptions({ ...assumptions, sellingCosts: Number(e.target.value) })}
                className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Capital Reserves
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={assumptions.capitalReserves}
                onChange={(e) => setAssumptions({ ...assumptions, capitalReserves: Number(e.target.value) })}
                className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Per unit per year</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Quick Scenarios</h3>
        
        <div className="space-y-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.name}
              onClick={() => setAssumptions({
                ...assumptions,
                rentGrowth: scenario.rentGrowth,
                expenseGrowth: scenario.expenseGrowth,
                exitCapRate: scenario.exitCapRate
              })}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-[#F9D96A] hover:bg-[#F9D96A]/5 transition-colors"
            >
              <div className="font-medium text-gray-900 mb-1">{scenario.name}</div>
              <div className="text-xs text-gray-600">
                Rent: {scenario.rentGrowth}% | Exp: {scenario.expenseGrowth}% | Exit: {scenario.exitCapRate}%
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-amber-900">
            <strong>Risk Agent:</strong> Consider sensitivity testing with 10% rent growth downside and 50bps cap rate expansion.
          </div>
        </div>
      </div>
    </div>
  );
}