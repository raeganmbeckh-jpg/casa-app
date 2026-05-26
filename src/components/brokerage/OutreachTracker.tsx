'use client'

import { Mail, Phone, Calendar, CheckCircle2 } from 'lucide-react'

const outreach = [
  {
    id: 'OUT-001',
    buyer: 'Sarah & Michael Chen',
    listing: '742 Evergreen Terrace',
    method: 'email',
    status: 'pending',
    sentAt: '2024-05-25 09:15 AM',
    nextFollowUp: '2024-05-27',
    notes: 'Sent listing details with neighborhood info'
  },
  {
    id: 'OUT-002',
    buyer: 'Robert Williams',
    listing: '123 Main Street',
    method: 'phone',
    status: 'completed',
    sentAt: '2024-05-24 02:30 PM',
    nextFollowUp: null,
    notes: 'Showing scheduled for 5/28 at 3pm'
  },
  {
    id: 'OUT-003',
    buyer: 'Emily Thompson',
    listing: '123 Main Street',
    method: 'email',
    status: 'responded',
    sentAt: '2024-05-23 11:00 AM',
    nextFollowUp: '2024-05-26',
    notes: 'Buyer expressed interest, requested virtual tour'
  }
]

const methodIcons = {
  email: Mail,
  phone: Phone,
  meeting: Calendar
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  responded: 'bg-blue-100 text-blue-800'
}

export default function OutreachTracker() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-serif text-gray-900">Outreach Tracker</h2>
        <p className="text-sm text-gray-600 mt-1">Contact history and follow-up schedule</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Buyer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Listing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Sent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Next Follow-Up
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {outreach.map((item) => {
              const Icon = methodIcons[item.method as keyof typeof methodIcons]
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.buyer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.listing}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 capitalize">{item.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[item.status as keyof typeof statusColors]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.sentAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.nextFollowUp || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.notes}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
