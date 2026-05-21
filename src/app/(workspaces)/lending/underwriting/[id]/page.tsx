'use client';

import { useState } from 'react';
import UnderwritingHeader from '@/components/lending/UnderwritingHeader';
import LoanInputs from '@/components/lending/LoanInputs';
import CoverageMetrics from '@/components/lending/CoverageMetrics';
import StressTestScenarios from '@/components/lending/StressTestScenarios';
import CollateralSummary from '@/components/lending/CollateralSummary';
import AgentRiskAssessment from '@/components/lending/AgentRiskAssessment';

export default function UnderwritingPage({ params }: { params: { id: string } }) {
  const [loanData, setLoanData] = useState({
    loanAmount: 2500000,
    interestRate: 6.5,
    term: 30,
    propertyValue: 3500000,
    noi: 245000,
    propertyType: 'Multifamily',
    location: 'Austin, TX'
  });

  const updateLoanData = (field: string, value: any) => {
    setLoanData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <UnderwritingHeader loanId={params.id} propertyAddress={loanData.location} />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LoanInputs data={loanData} onChange={updateLoanData} />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <CoverageMetrics loanData={loanData} />
            <CollateralSummary loanData={loanData} />
          </div>
        </div>

        <StressTestScenarios loanData={loanData} />
        <AgentRiskAssessment loanData={loanData} />
      </div>
    </div>
  );
}