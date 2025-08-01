import { Card, CardContent } from '@/components/ui/card'

const features = [
  { name: 'AI Assistant', usage: '89%', color: 'text-sky-600' },
  { name: 'Voice Branding', usage: '72%', color: 'text-purple-600' },
  { name: 'Invoices', usage: '97%', color: 'text-green-600' },
  { name: 'System Logs', usage: '64%', color: 'text-yellow-600' }
]

export function AdminFeatureUsagePanel() {
  return (
    <Card className="glass-card">
      <CardContent className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">🛠 Feature Usage Snapshot</h2>
        <ul className="space-y-2">
          {features.map((f, idx) => (
            <li key={idx} className="flex justify-between items-center">
              <span className="font-semibold">{f.name}</span>
              <span className={`text-sm font-bold ${f.color}`}>{f.usage}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}