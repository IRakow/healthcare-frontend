import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function AdminPdfExportPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-sky-700">📤 Export to PDF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">Generate PDF versions of reports or patient data.</p>
        <button className="bg-sky-600 text-white px-4 py-2 rounded-xl hover:bg-sky-700 transition">
          Export Overview
        </button>
      </CardContent>
    </Card>
  )
}