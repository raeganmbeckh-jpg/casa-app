interface UnderwritingHeaderProps {
  loanId: string;
  propertyAddress: string;
}

export default function UnderwritingHeader({ loanId, propertyAddress }: UnderwritingHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-cormorant text-3xl font-semibold text-gray-900">
                Loan Underwriting
              </h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                #{loanId}
              </span>
            </div>
            <p className="text-gray-600">{propertyAddress}</p>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-[#F9D96A] text-gray-900 rounded-lg hover:bg-[#f7d255] transition-colors font-medium">
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}