import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommand'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Radio } from 'lucide-react'

export default function AdminBroadcastPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Radio className="w-5 h-5 text-red-600" /> Admin Broadcast Center
      </h1>
      <Card className="p-4 space-y-2">
        <p className="text-sm">Last message sent: Aug 1 • "Platform update notice"</p>
        <Badge variant="secondary">SMS & Email linked</Badge>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'broadcast')} context="broadcast" />
    </div>
  )
}