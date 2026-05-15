'use client'

import { Search, Filter } from 'lucide-react'

export function LoanFilters() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by borrower, property address, or loan ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
            <option>All Stages</option>
            <option>Application</option>
            <option>Underwriting</option>
            <option>Approval Pending</option>
            <option>Due Diligence</option>
            <option>Docs/Closing</option>
            <option>On Hold</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
            <option>All Loan Types</option>
            <option>Acquisition</option>
            <option>Refinance</option>
            <option>Construction</option>
            <option>Bridge</option>
            <option>Permanent</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
            <option>All Property Types</option>
            <option>Multifamily</option>
            <option>Office</option>
            <option>Retail</option>
            <option>Industrial</option>
            <option>Mixed-Use</option>
            <option>Single-Family</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>
    </div>
  )
}
