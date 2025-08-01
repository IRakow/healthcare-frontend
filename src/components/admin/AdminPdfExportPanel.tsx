import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Download } from 'lucide-react'

export function AdminPdfExportPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-sky-700 flex items-center gap-2">
          <Download className="w-5 h-5" /> Export to PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-gray-600">Generate PDF reports based on your current view or filters.</p>
        <div className="flex gap-3">
          <button className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition">
            Export Overview
          </button>
          <button className="bg-sky-100 text-sky-800 px-4 py-2 rounded-lg hover:bg-sky-200 transition">
            Export Patient List
          </button>
        </div>
      </CardContent>
    </Card>
  )
}