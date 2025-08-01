import { Card, CardContent } from '@/components/ui/card'

const timelineEvents = [
  { type: 'ai', label: 'AI Response Triggered', detail: 'Gemini used for lab summary', time: '4:11 PM' },
  { type: 'upload', label: 'File Uploaded', detail: 'CT Scan added to Patient #433', time: '3:47 PM' },
  { type: 'access', label: 'Record Accessed', detail: 'Provider viewed Timeline of Patient #901', time: '3:12 PM' },
]

const icon = {
  ai: '🧠',
  upload: '📁',
  access: '🔍'
}

export function AdminTimeline() {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">📜 System Timeline</h2>
        <ol className="relative border-l border-slate-300 pl-4 space-y-6">
          {timelineEvents.map((item, idx) => (
            <li key={idx} className="relative">
              <div className="absolute -left-[14px] bg-white w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center text-sm">
                {icon[item.type]}
              </div>
              <div className="ml-2">
                <p className="font-semibold text-slate-800">{item.label}</p>
                <p className="text-sm text-slate-600">{item.detail}</p>
                <p className="text-xs text-slate-400 mt-1">{item.time}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}