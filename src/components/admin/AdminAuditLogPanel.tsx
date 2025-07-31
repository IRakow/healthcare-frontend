import { Card, CardContent } from '@/components/ui/card'

const fakeAuditLogs = [
  { user: 'john@atlas.com', action: 'AI Response Generated', model: 'Gemini', date: '2025-07-30', status: '✅' },
  { user: 'ian@admin.com', action: 'Invoice Generated', model: '-', date: '2025-07-29', status: '✅' },
  { user: 'tech@nova.com', action: 'AI Response Failed', model: 'OpenAI', date: '2025-07-28', status: '⚠️' },
]

export function AdminAuditLogPanel() {
  return (
    <Card className="glass-card mt-6">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">System + AI Audit Logs</h2>
        <table className="w-full text-sm text-slate-700">
          <thead>
            <tr className="text-left border-b border-slate-300">
              <th className="py-2">User</th>
              <th>Action</th>
              <th>Model</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fakeAuditLogs.map((log, i) => (
              <tr key={i} className="border-b border-slate-200 hover:bg-white/60 transition">
                <td className="py-2">{log.user}</td>
                <td>{log.action}</td>
                <td>{log.model}</td>
                <td>{log.date}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}