import ProFormaHeader from '@/components/development/ProFormaHeader';
import CostInputs from '@/components/development/CostInputs';
import ROICalculator from '@/components/development/ROICalculator';
import CostBreakdown from '@/components/development/CostBreakdown';
import SensitivityAnalysis from '@/components/development/SensitivityAnalysis';
import AssumptionsPanel from '@/components/development/AssumptionsPanel';

export default function ProFormaPage() {
  return (
    <div className="space-y-6">
      <ProFormaHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CostInputs />
          <CostBreakdown />
          <SensitivityAnalysis />
        </div>
        
        <div className="space-y-6">
          <ROICalculator />
          <AssumptionsPanel />
        </div>
      </div>
    </div>
  );
}