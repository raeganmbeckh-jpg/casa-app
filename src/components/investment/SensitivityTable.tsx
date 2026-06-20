'use client';

export default function SensitivityTable() {
  // Mock sensitivity data - in production this would be calculated dynamically
  const capRates = [6.5, 7.0, 7.5, 8.0, 8.5];
  const exitPrices = [4800000, 5000000, 5200000, 5400000, 5600000];
  
  // Mock IRR values for sensitivity matrix
  const irrMatrix = [
    [16.2, 15.1, 14.0, 12.9, 11.8],
    [15.4, 14.3, 13.2, 12.1, 11.0],
    [14.7, 13.6, 12.5, 11.4, 10.3],
    [14.0, 12.9, 11.8, 10.7, 9.6],
    [13.3, 12.2, 11.1, 10.0, 8.9]
  ];

  const getColorClass = (value: number) => {
    if (value >= 15) return 'bg-green-100 text-green-900';
    if (value >= 12) return 'bg-blue-100 text-blue-900';
    if (value >= 10) return 'bg-yellow-100 text-yellow-900';
    return 'bg-red-100 text-red-900';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6">IRR Sensitivity Analysis</h2>
      
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Exit Cap Rate</span> vs <span className="font-medium">Exit Price</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-gray-600">&gt;15%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-gray-600">12-15%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span className="text-gray-600">10-12%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-gray-600">&lt;10%</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Exit Cap Rate</th>
              {exitPrices.map(price => (
                <th key={price} className="text-center py-3 px-4 font-medium text-gray-600">
                  ${(price / 1000000).toFixed(1)}M
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capRates.map((rate, rateIndex) => (
              <tr key={rate} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{rate.toFixed(1)}%</td>
                {irrMatrix[rateIndex].map((irr, priceIndex) => (
                  <td key={priceIndex} className="text-center py-3 px-4">
                    <span className={`inline-block px-3 py-1 rounded font-medium ${getColorClass(irr)}`}>
                      {irr.toFixed(1)}%
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        Base case assumes 7.5% exit cap rate and $5.2M exit price (highlighted with border in full version)
      </div>
    </div>
  );
}