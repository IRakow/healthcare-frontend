import { Card, CardContent } from '@/components/ui/card'

export function AdminCustomReportPanel() {
  return (
    <Card className="glass-card">
      <CardContent className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">📁 Custom Report Generator</h2>
        <p className="text-sm text-slate-600">Generate a downloadable report based on your selected category:</p>
        <select className="w-full bg-white/50 backdrop-blur border rounded-xl px-4 py-2">
          <option value="">Select a Report Type</option>
          <option value="ai">AI Interaction Summary</option>
          <option value="billing">Employer Billing Overview</option>
          <option value="usage">Feature Usage Analysis</option>
        </select>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition">
          Generate Report
        </button>
      </CardContent>
    </Card>
  )
}