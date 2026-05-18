'use client';

import { useState } from 'react';

export default function ROICalculator() {
  const [revenue, setRevenue] = useState({
    residentialSales: 9800000,
    commercialLeases: 1250000,
    parkingRevenue: 180000,
  });

  const totalRevenue = Object.values(revenue).reduce((sum, val) => sum + val, 0);
  const totalCosts = 8450000; // From header
  const netProfit = totalRevenue - totalCosts;
  const roi = ((netProfit / totalCosts) * 100).toFixed(1);
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">ROI Calculator</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Residential Sales</label>
          <input
            type="text"
            value={formatCurrency(revenue.residentialSales)}
            onChange={(e) => setRevenue({ ...revenue, residentialSales: parseFloat(e.target.value.replace(/[^0-9.-]+/g, '')) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Commercial Leases (10yr NPV)</label>
          <input
            type="text"
            value={formatCurrency(revenue.commercialLeases)}
            onChange={(e) => setRevenue({ ...revenue, commercialLeases: parseFloat(e.target.value.replace(/[^0-9.-]+/g, '')) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Parking Revenue (10yr NPV)</label>
          <input
            type="text"
            value={formatCurrency(revenue.parkingRevenue)}
            onChange={(e) => setRevenue({ ...revenue, parkingRevenue: parseFloat(e.target.value.replace(/[^0-9.-]+/g, '')) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Revenue</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Costs</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(totalCosts)}</span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-sm font-bold text-gray-900">Net Profit</span>
          <span className="text-xl font-bold text-green-600">{formatCurrency(netProfit)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">ROI</span>
          <span className="text-xl font-bold text-green-600">{roi}%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">Profit Margin</span>
          <span className="text-xl font-bold text-gray-900">{profitMargin}%</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="text-sm font-medium text-green-800">Strong Returns</div>
            <div className="text-xs text-green-700 mt-1">
              This project exceeds the target 20% ROI threshold. Agent consensus: PROCEED.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}