export function CommunicationLog() {
  const communications = [
    {
      id: 'C001',
      tenant: 'Sarah Johnson',
      unit: '2A',
      type: 'email',
      subject: 'Lease Renewal Offer',
      date: '2024-04-18',
      status: 'sent',
      preview: 'Hi Sarah, we're pleased to offer you a lease renewal...',
    },
    {
      id: 'C002',
      tenant: 'Michael Chen',
      unit: '5C',
      type: 'phone',
      subject: 'Late Rent Follow-up',
      date: '2024-04-17',
      status: 'completed',
      preview: 'Spoke with Michael about April rent payment...',
    },
    {
      id: 'C003',
      tenant: 'Emily Rodriguez',
      unit: '12B',
      type: 'text',
      subject: 'Maintenance Request Acknowledgment',
      date: '2024-04-16',
      status: 'sent',
      preview: 'We've received your maintenance request for...',
    },
    {
      id: 'C004',
      tenant: 'Jennifer Martinez',
      unit: '8A',
      type: 'email',
      subject: 'Move-Out Notice Received',
      date: '2024-04-15',
      status: 'sent',
      preview: 'Thank you for your 60-day notice. We'll schedule...',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold font-cormorant text-gray-900">Recent Communications</h2>
        <button className="px-3 py-1.5 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors">
          + New Message
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {communications.map((comm) => (
          <div key={comm.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    comm.type === 'email'
                      ? 'bg-blue-100 text-blue-700'
                      : comm.type === 'phone'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {comm.type === 'email' ? '✉' : comm.type === 'phone' ? '☎' : '💬'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{comm.tenant}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">{comm.unit}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">{comm.date}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium text-gray-700">{comm.subject}</div>
                  <div className="mt-1 text-sm text-gray-600">{comm.preview}</div>
                </div>
              </div>
              <span
                className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  comm.status === 'sent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {comm.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 text-center">
        <button className="text-sm text-[#F9D96A] hover:text-[#f5d153] font-medium">
          View All Communications →
        </button>
      </div>
    </div>
  );
}