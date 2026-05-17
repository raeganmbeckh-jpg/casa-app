'use client';

import { useState } from 'react';

export default function PropertyInputs() {
  const [inputs, setInputs] = useState({
    purchasePrice: 5000000,
    closingCosts: 150000,
    renovation: 500000,
    grossIncome: 650000,
    vacancy: 5,
    opex: 195000,
    capRate: 0,
    downPayment: 25,
    interestRate: 6.5,
    loanTerm: 30,
    holdPeriod: 5
  });

  const updateInput = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6">Property Inputs</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={inputs.purchasePrice}
              onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Closing Costs</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={inputs.closingCosts}
              onChange={(e) => updateInput('closingCosts', Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Renovation Budget</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={inputs.renovation}
              onChange={(e) => updateInput('renovation', Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gross Annual Income</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={inputs.grossIncome}
              onChange={(e) => updateInput('grossIncome', Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vacancy Rate</label>
          <div className="relative">
            <input
              type="number"
              value={inputs.vacancy}
              onChange={(e) => updateInput('vacancy', Number(e.target.value))}
              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Annual Operating Expenses</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={inputs.opex}
              onChange={(e) => updateInput('opex', Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
          <div className="relative">
            <input
              type="number"
              value={inputs.downPayment}
              onChange={(e) => updateInput('downPayment', Number(e.target.value))}
              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={inputs.interestRate}
              onChange={(e) => updateInput('interestRate', Number(e.target.value))}
              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term (Years)</label>
          <input
            type="number"
            value={inputs.loanTerm}
            onChange={(e) => updateInput('loanTerm', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hold Period (Years)</label>
          <input
            type="number"
            value={inputs.holdPeriod}
            onChange={(e) => updateInput('holdPeriod', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}