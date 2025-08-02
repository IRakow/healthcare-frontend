import AdminLayout from '@/components/layout/AdminLayout'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommand'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'

export default function AdminAuditPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-yellow-600" /> Admin Audit Log
      </h1>
      <Card className="p-4 space-y-2">
        <p className="text-sm">Last audit scan: Today at 12:24pm</p>
        <p className="text-sm">Compliance mode: Enabled</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'audit')} context="audit" />
    </AdminLayout>
  )
}