import { Card, CardContent } from '@/components/ui/card'

export function AuditLogSearch() {
  return (
    <Card className="glass-card mt-6">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Search AI / System Logs</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search input/output..."
            className="flex-1 px-4 py-2 rounded-xl border bg-white/50 backdrop-blur"
          />
          <button className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-xl shadow">
            Search
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Advanced log filter support coming soon.</p>
      </CardContent>
    </Card>
  )
}