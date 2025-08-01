import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

const timeline = [
  { type: 'ai', icon: '🤖', title: 'AI Follow-up', detail: 'Assistant flagged potential dehydration.', time: 'Today, 10:42 AM' },
  { type: 'lab', icon: '🧪', title: 'CBC Result', detail: 'Low hemoglobin. Flagged for review.', time: 'Yesterday' },
  { type: 'doc', icon: '📁', title: 'File Uploaded', detail: 'X-ray report from MyChart', time: 'Monday' },
  { type: 'med', icon: '💊', title: 'Prescription Filled', detail: 'Lisinopril 10mg via CVS', time: 'Last Week' },
]

export function PatientTimelinePanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sky-700">
          <Clock className="w-5 h-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {timeline.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <div className="text-xl">{item.icon}</div>
              <div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-slate-600 text-xs">{item.detail}</p>
                <p className="text-slate-400 text-xs">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}