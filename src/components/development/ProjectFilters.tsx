'use client'

import { Search, Filter, Download } from 'lucide-react'

export function ProjectFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects by name, address, or developer..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
        />
      </div>

      {/* Stage Filter */}
      <select className="px-4 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
        <option>All Stages</option>
        <option>Concept</option>
        <option>Pre-Development</option>
        <option>Permitting</option>
        <option>Under Construction</option>
        <option>Lease-Up</option>
        <option>Stabilized</option>
      </select>

      {/* Asset Type Filter */}
      <select className="px-4 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
        <option>All Types</option>
        <option>Multifamily</option>
        <option>Office</option>
        <option>Retail</option>
        <option>Industrial</option>
        <option>Mixed-Use</option>
      </select>

      {/* More Filters Button */}
      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm hover:bg-gray-50 transition-colors">
        <Filter className="w-4 h-4" />
        More Filters
      </button>

      {/* Export Button */}
      <button className="flex items-center gap-2 px-4 py-2 bg-[#F9D96A] text-gray-900 rounded-lg font-['Inter'] text-sm font-medium hover:bg-[#F9D96A]/90 transition-colors">
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  )
}
