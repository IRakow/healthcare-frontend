import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Bot } from 'lucide-react'

const feed = [
  { user: 'john@atlas.com', prompt: 'Show me last lab results', outputLength: 422, model: 'Gemini', time: '4:18 PM' },
  { user: 'sara@nova.com', prompt: 'Book an appointment with Dr. Chu', outputLength: 189, model: 'OpenAI', time: '4:06 PM' },
  { user: 'ian@admin.com', prompt: 'Generate invoice summary', outputLength: 312, model: 'Gemini', time: '3:58 PM' },
]

const getColor = (model: string) => model === 'Gemini' ? 'text-purple-600' : 'text-blue-600'

export function AdminAiActivityFeed() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-violet-700 flex items-center gap-2">
          <Bot className="w-5 h-5" /> AI Assistant Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="space-y-4 max-h-[320px] overflow-y-auto pr-2 text-sm">
          {feed.map((entry, i) => (
            <li key={i} className="border-b pb-2 border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">{entry.user}</span>
                <span className={`text-xs font-medium ${getColor(entry.model)}`}>{entry.model}</span>
              </div>
              <p className="text-slate-800 italic mt-1">"{entry.prompt}"</p>
              <p className="text-xs text-slate-500 mt-1">Chars: {entry.outputLength} • {entry.time}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}