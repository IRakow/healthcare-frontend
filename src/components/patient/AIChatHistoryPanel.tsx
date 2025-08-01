import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot } from 'lucide-react'

const chats = [
  { id: '1', prompt: 'Can you interpret my lab results?', response: 'Your WBC is normal. Hemoglobin is borderline low.', time: 'Today, 9:12 AM' },
  { id: '2', prompt: 'What's a good high-protein breakfast?', response: 'Try Greek yogurt with seeds and almond butter.', time: 'Yesterday' }
]

export function AIChatHistoryPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-700">
          <Bot className="w-5 h-5" />
          AI Conversation History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chats.map(chat => (
          <div key={chat.id} className="rounded-lg bg-white/60 p-4 shadow-sm border">
            <p className="font-medium text-gray-800">🧠 {chat.prompt}</p>
            <p className="text-sm text-gray-600 mt-2">💬 {chat.response}</p>
            <p className="text-xs text-gray-400 mt-1">{chat.time}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}