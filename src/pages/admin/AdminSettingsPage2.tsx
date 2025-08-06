import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommand'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-green-600" /> Admin Settings
      </h1>
      <Card className="p-4 space-y-2">
        <p className="text-sm">Current environment: <Badge>Production</Badge></p>
        <p className="text-sm">Voice assistant: <Badge variant="secondary">Rachel (active)</Badge></p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'settings')} context="settings" />
    </div>
  )
}