import { Card, CardContent } from '@/components/ui/card'

export function AdminPdfExportPanel() {
  return (
    <Card className="glass-card">
      <CardContent className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 mb-2">📤 Export Reports to PDF</h2>
        <p className="text-slate-600 text-sm">Select which dashboard section you'd like to export as a styled PDF document.</p>
        <div className="flex gap-4">
          <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl transition shadow">
            Export Overview
          </button>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition shadow">
            Export AI Logs
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow">
            Export Employers
          </button>
        </div>
        <p className="text-xs text-slate-400">* Actual export logic will hook into client PDF renderer.</p>
      </CardContent>
    </Card>
  )
}