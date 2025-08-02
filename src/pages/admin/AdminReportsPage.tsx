import AdminLayout from '@/components/layout/AdminLayout'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommand'
import { Card } from '@/components/ui/card'
import { PieChart } from 'lucide-react'

export default function AdminReportsPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-indigo-600" /> Custom Reports
      </h1>
      <Card className="p-4 space-y-2">
        <p className="text-sm">Generate and manage saved analytics views.</p>
        <p className="text-sm">Recent: Employer cost projection, Billing velocity Q3</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'reports')} context="reports" />
    </AdminLayout>
  )
}