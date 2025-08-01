import { Card, CardContent } from '@/components/ui/card'

const aiFeed = [
  { user: 'john@atlas.com', prompt: 'Show me last lab results', outputLength: 422, model: 'Gemini', time: '4:18 PM' },
  { user: 'sara@nova.com', prompt: 'Book an appointment with Dr. Chu', outputLength: 189, model: 'OpenAI', time: '4:06 PM' },
  { user: 'ian@admin.com', prompt: 'Generate invoice summary', outputLength: 312, model: 'Gemini', time: '3:58 PM' },
]

export function AdminAiActivityFeed() {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">🧠 AI Assistant Activity Feed</h2>
        <ul className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
          {aiFeed.map((entry, i) => (
            <li key={i} className="border-b pb-2 border-slate-200">
              <div className="text-sm text-slate-600 mb-1">
                <span className="font-semibold">{entry.user}</span> at {entry.time}
              </div>
              <div className="text-slate-800 italic text-sm">"{entry.prompt}"</div>
              <div className="text-xs text-slate-500 mt-1">
                Model: {entry.model} · Response: {entry.outputLength} chars
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}