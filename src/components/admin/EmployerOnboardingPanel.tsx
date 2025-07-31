import { Card, CardContent } from '@/components/ui/card'

const employers = [
  { name: 'Techfinity', status: 'Completed' },
  { name: 'NovaHealth', status: 'Pending Docs' },
  { name: 'Atlas Inc', status: 'Awaiting Payment' },
]

export function EmployerOnboardingPanel() {
  return (
    <Card className="glass-card mt-6">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Employer Onboarding Tracker</h2>
        <ul className="space-y-3">
          {employers.map((e, i) => (
            <li key={i} className="flex justify-between border-b pb-2 border-slate-200">
              <span>{e.name}</span>
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                e.status === 'Completed' ? 'bg-green-100 text-green-700' :
                e.status.includes('Pending') ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {e.status}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}