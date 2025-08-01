import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ClipboardList } from 'lucide-react'

export function AdminCustomReportPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> Custom Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select className="w-full border px-3 py-2 rounded-lg text-sm bg-white/60 backdrop-blur">
          <option>Choose Report Type</option>
          <option>AI Summary</option>
          <option>Appointments This Week</option>
          <option>Recent High-Risk Patients</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full">
          Generate Report
        </button>
      </CardContent>
    </Card>
  )
}