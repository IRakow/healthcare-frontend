import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommand'
import { Card } from '@/components/ui/card'
import { FileText, ArchiveRestore, PieChart } from 'lucide-react'

export function AdminBackupPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ArchiveRestore className="w-5 h-5 text-purple-600" /> Admin Backup Center
      </h1>
      <Card className="p-4 space-y-2">
        <p className="text-sm">Last backup completed 2 hours ago</p>
        <p className="text-sm">Scheduled backups: Daily at 2:00 AM</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'backup')} context="backup" />
    </div>
  )
}

export function AdminPdfExportPage() {
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

export function AdminReportsPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-indigo-600" /> Custom Reports
      </h1>
      <Card className="p-4 space-y-2">
        <p className="text-sm">Generate and manage saved analytics views.</p>
        <p className="text-sm">Recent: Employer cost projection, Billing velocity Q3</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'reports')} context="reports" />
    </div>
  )
}