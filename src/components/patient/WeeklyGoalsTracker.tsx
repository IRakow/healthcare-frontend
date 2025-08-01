import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

const goals = [
  { label: 'Sleep 7+ hrs', met: true },
  { label: 'Protein 60g/day', met: true },
  { label: 'Hydration 80oz/day', met: false },
  { label: 'Log 3 meals', met: true }
]

export function WeeklyGoalsTracker() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          Weekly Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goals.map((g, i) => (
          <div
            key={i}
            className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between border shadow-sm
              ${g.met ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white/60 text-gray-600 border-gray-200'}`}
          >
            {g.label}
            {g.met && <span className="text-green-500 text-xs">✓</span>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}