import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommand'
import { Card } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function AdminPdfExportPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" /> PDF Export History
      </h1>
      <Card className="p-4 space-y-2">
        <p className="text-sm">Last exported file: invoice_summary_aug01.pdf</p>
        <p className="text-sm">Export method: Voice request from Rachel</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'pdf')} context="pdf" />
    </div>
  )
}