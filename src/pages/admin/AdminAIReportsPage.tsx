import AdminSmartChartPanel from '@/components/admin/AdminSmartChartPanel'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommandEnhanced'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import VoiceHUDOverlay from '@/components/voice/VoiceHUDOverlaySimple'
import { useEffect } from 'react'
import { FileTextIcon } from 'lucide-react'

export default function AdminAIReportsPage() {
  const { startListening, interimText } = useAdminVoiceCapture()

  useEffect(() => {
    startListening()
  }, [])

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <FileTextIcon className="w-6 h-6 text-blue-600" /> AI Reports & Trends
        </h1>

        <AdminSmartChartPanel />

        <div className="mt-10">
          <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'charts')} context="charts" />
        </div>

        <VoiceHUDOverlay interim={interimText} />
      </div>
    </div>
  )
}