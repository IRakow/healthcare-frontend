import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function AdminCustomReportPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-blue-800">📁 Custom Report Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">Select a report type:</p>
        <select className="w-full border rounded-lg px-3 py-2 bg-white/50 backdrop-blur">
          <option>AI Summary</option>
          <option>Medication History</option>
          <option>Lab Results</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
          Generate Report
        </button>
      </CardContent>
    </Card>
  )
}