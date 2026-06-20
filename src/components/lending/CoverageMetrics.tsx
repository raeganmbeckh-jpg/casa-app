interface CoverageMetricsProps {
  loanData: {
    loanAmount: number;
    interestRate: number;
    term: number;
    propertyValue: number;
    noi: number;
  };
}

export default function CoverageMetrics({ loanData }: CoverageMetricsProps) {
  const monthlyRate = loanData.interestRate / 100 / 12;
  const numPayments = loanData.term * 12;
  const monthlyPayment = loanData.loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualDebtService = monthlyPayment * 12;
  
  const dscr = loanData.noi / annualDebtService;
  const ltv = (loanData.loanAmount / loanData.propertyValue) * 100;
  const debtYield = (loanData.noi / loanData.loanAmount) * 100;
  
  const metrics = [
    {
      label: 'DSCR',
      value: dscr.toFixed(2) + 'x',
      status: dscr >= 1.25 ? 'excellent' : dscr >= 1.15 ? 'good' : 'warning',
      benchmark: 'Target: 1.25x+'
    },
    {
      label: 'LTV',
      value: ltv.toFixed(1) + '%',
      status: ltv <= 75 ? 'excellent' : ltv <= 80 ? 'good' : 'warning',
      benchmark: 'Target: ≤75%'
    },
    {
      label: 'Debt Yield',
      value: debtYield.toFixed(2) + '%',
      status: debtYield >= 10 ? 'excellent' : debtYield >= 8 ? 'good' : 'warning',
      benchmark: 'Target: 10%+'
    },
    {
      label: 'Annual Debt Service',
      value: '$' + annualDebtService.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      status: 'neutral',
      benchmark: '$' + monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 }) + '/mo'
    }
  ];

  const statusColors = {
    excellent: 'bg-green-50 text-green-700 border-green-200',
    good: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="font-cormorant text-xl font-semibold text-gray-900 mb-6">
        Coverage Metrics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 ${statusColors[metric.status]}`}
          >
            <div className="text-sm font-medium mb-1">{metric.label}</div>
            <div className="text-2xl font-semibold mb-2">{metric.value}</div>
            <div className="text-xs opacity-75">{metric.benchmark}</div>
          </div>
        ))}
      </div>
    </div>
  );
}