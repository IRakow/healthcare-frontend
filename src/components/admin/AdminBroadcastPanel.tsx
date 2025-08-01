// Module 12: AdminBroadcastPanel.tsx
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function AdminBroadcastPanel() {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-rose-600 flex items-center gap-2">
          <Megaphone className="w-5 h-5" /> Broadcast Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Send update to all employer admins..."
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button
          className="w-full bg-rose-600 hover:bg-rose-700 text-white"
          disabled={!message.trim()}
          onClick={handleSend}
        >
          📣 Send Broadcast
        </Button>
        {sent && (
          <p className="text-xs text-green-600 font-medium">Broadcast sent successfully</p>
        )}
      </CardContent>
    </Card>
  )
}