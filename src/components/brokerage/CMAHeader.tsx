import { FileText, Download, Share2 } from 'lucide-react'

export function CMAHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-serif text-gray-900">CMA Generator</h1>
        <p className="text-gray-600 mt-1">Instant comparative market analysis with AI-powered pricing</p>
      </div>
      
      <div className="flex gap-3">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
        <button className="px-4 py-2 bg-[#F9D96A] text-gray-900 rounded-lg hover:bg-[#f7d04f] flex items-center gap-2">
          <FileText className="w-4 h-4" />
          New CMA
        </button>
      </div>
    </div>
  )
}
