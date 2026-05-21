interface LoanInputsProps {
  data: {
    loanAmount: number;
    interestRate: number;
    term: number;
    propertyValue: number;
    noi: number;
    propertyType: string;
  };
  onChange: (field: string, value: any) => void;
}

export default function LoanInputs({ data, onChange }: LoanInputsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-cormorant text-xl font-semibold text-gray-900 mb-6">
        Loan Parameters
      </h3>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={data.loanAmount}
              onChange={(e) => onChange('loanAmount', Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={data.interestRate}
            onChange={(e) => onChange('interestRate', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Term (years)
          </label>
          <input
            type="number"
            value={data.term}
            onChange={(e) => onChange('term', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={data.propertyValue}
              onChange={(e) => onChange('propertyValue', Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Net Operating Income
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={data.noi}
              onChange={(e) => onChange('noi', Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type
          </label>
          <select
            value={data.propertyType}
            onChange={(e) => onChange('propertyType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          >
            <option>Multifamily</option>
            <option>Office</option>
            <option>Retail</option>
            <option>Industrial</option>
            <option>Mixed-Use</option>
          </select>
        </div>
      </div>
    </div>
  );
}