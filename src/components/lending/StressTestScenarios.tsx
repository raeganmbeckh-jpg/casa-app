interface StressTestScenariosProps {
  loanData: {
    loanAmount: number;
    interestRate: number;
    term: number;
    propertyValue: number;
    noi: number;
  };
}

export default function StressTestScenarios({ loanData }: StressTestScenariosProps) {
  const calculateDSCR = (noi: number, rate: number) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = loanData.term * 12;
    const monthlyPayment = loanData.loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    return noi / annualDebtService;
  };

  const scenarios = [
    {
      name: 'Base Case',
      noiChange: 0,
      rateChange: 0,
      valueChange: 0
    },
    {
      name: 'NOI -10%',
      noiChange: -10,
      rateChange: 0,
      valueChange: 0
    },
    {
      name: 'Rate +1%',
      noiChange: 0,
      rateChange: 1,
      valueChange: 0
    },
    {
      name: 'Value -15%',
      noiChange: 0,
      rateChange: 0,
      valueChange: -15
    },
    {
      name: 'Combined Stress',
      noiChange: -10,
      rateChange: 1,
      valueChange: -15
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-cormorant text-xl font-semibold text-gray-900">
          Stress Test Scenarios
        </h3>
        <span className="text-sm text-gray-500">Impact on key metrics</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Scenario</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">DSCR</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">LTV</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario, idx) => {
              const stressedNOI = loanData.noi * (1 + scenario.noiChange / 100);
              const stressedRate = loanData.interestRate + scenario.rateChange;
              const stressedValue = loanData.propertyValue * (1 + scenario.valueChange / 100);
              
              const dscr = calculateDSCR(stressedNOI, stressedRate);
              const ltv = (loanData.loanAmount / stressedValue) * 100;
              
              const statusColor = dscr >= 1.25 && ltv <= 75 ? 'text-green-600' : 
                                  dscr >= 1.15 && ltv <= 80 ? 'text-blue-600' : 'text-amber-600';
              
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{scenario.name}</div>
                    {(scenario.noiChange !== 0 || scenario.rateChange !== 0 || scenario.valueChange !== 0) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {scenario.noiChange !== 0 && `NOI ${scenario.noiChange > 0 ? '+' : ''}${scenario.noiChange}% `}
                        {scenario.rateChange !== 0 && `Rate +${scenario.rateChange}% `}
                        {scenario.valueChange !== 0 && `Value ${scenario.valueChange}%`}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{dscr.toFixed(2)}x</td>
                  <td className="py-3 px-4 text-right font-medium">{ltv.toFixed(1)}%</td>
                  <td className={`py-3 px-4 text-right font-medium ${statusColor}`}>
                    {dscr >= 1.25 && ltv <= 75 ? 'Pass' : dscr >= 1.15 && ltv <= 80 ? 'Caution' : 'Fail'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}