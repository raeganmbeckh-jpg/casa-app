import UnderwritingHeader from '@/components/investment/UnderwritingHeader';
import PropertyInputs from '@/components/investment/PropertyInputs';
import ReturnsCalculator from '@/components/investment/ReturnsCalculator';
import SensitivityTable from '@/components/investment/SensitivityTable';
import NOIBreakdown from '@/components/investment/NOIBreakdown';
import AssumptionsPanel from '@/components/investment/AssumptionsPanel';

export default function UnderwritingPage() {
  return (
    <div className="space-y-6">
      <UnderwritingHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PropertyInputs />
          <ReturnsCalculator />
          <NOIBreakdown />
          <SensitivityTable />
        </div>
        
        <div className="space-y-6">
          <AssumptionsPanel />
        </div>
      </div>
    </div>
  );
}