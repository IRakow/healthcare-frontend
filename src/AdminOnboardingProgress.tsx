// src/pages/AdminOnboardingProgress.tsx
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const steps = [
  { id: 1, title: 'Upload Logo', completed: true },
  { id: 2, title: 'Add Employer Info', completed: true },
  { id: 3, title: 'Configure Billing', completed: false },
  { id: 4, title: 'Set Voice Assistant', completed: false },
  { id: 5, title: 'Finalize Branding', completed: false }
]

export default function AdminOnboardingProgress() {
  const completedSteps = steps.filter((s) => s.completed).length
  const percent = Math.round((completedSteps / steps.length) * 100)

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-md font-medium">🚀 Onboarding Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={percent} className="mb-4" />
        <ul className="space-y-1 text-sm">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`flex items-center gap-2 ${step.completed ? 'text-green-600' : 'text-gray-500'}`}
            >
              <span>{step.completed ? '✅' : '⬜️'}</span>
              <span>{step.title}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}