interface CollateralSummaryProps {
  loanData: {
    propertyValue: number;
    propertyType: string;
    location: string;
  };
}

export default function CollateralSummary({ loanData }: CollateralSummaryProps) {
  const details = [
    { label: 'Property Type', value: loanData.propertyType },
    { label: 'Location', value: loanData.location },
    { label: 'Appraised Value', value: '$' + loanData.propertyValue.toLocaleString() },
    { label: 'Appraisal Date', value: '2024-04-15' },
    { label: 'Year Built', value: '2018' },
    { label: 'Square Footage', value: '45,000 SF' },
    { label: 'Occupancy', value: '92%' },
    { label: 'Condition', value: 'Good' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-cormorant text-xl font-semibold text-gray-900">
          Collateral Summary
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View Full Report →
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {details.map((detail, idx) => (
          <div key={idx} className="border-b border-gray-100 pb-3">
            <div className="text-sm text-gray-500 mb-1">{detail.label}</div>
            <div className="font-medium text-gray-900">{detail.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}