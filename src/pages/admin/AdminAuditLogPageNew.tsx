import AdminLayout from '@/layouts/AdminLayout'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import VoiceHUDOverlay from '@/components/voice/VoiceHUDOverlay'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommandEnhanced'
import { useEffect, useState } from 'react'
import { speak } from '@/lib/voice/RachelTTSQueue'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ShieldCheckIcon } from 'lucide-react'

const fakeLogs = [
  { id: 1, action: 'Login', actor: 'admin@nova.com', time: '2 mins ago' },
  { id: 2, action: 'Exported report', actor: 'ian@owner.com', time: '12 mins ago' },
  { id: 3, action: 'Deleted user', actor: 'jane@admin.com', time: '45 mins ago' },
  { id: 4, action: 'Billing sync', actor: 'system', time: '1 hour ago' },
  { id: 5, action: 'Reset password', actor: 'admin@brightwell.com', time: '2 hrs ago' },
  { id: 6, action: 'HIPAA check passed', actor: 'system', time: '4 hrs ago' }
]

export default function AdminAuditLogPage() {
  const { startListening, interimText } = useAdminVoiceCapture()
  const [logs] = useState(fakeLogs)

  useEffect(() => {
    startListening()
    speak('Loaded audit logs. Say export, errors, or filter by actor.')
  }, [])

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-emerald-600" /> Audit Log & Compliance
        </h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{log.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-8">
          <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'audit')} />
        </div>

        <VoiceHUDOverlay interim={interimText} />
      </div>
    </AdminLayout>
  )
}