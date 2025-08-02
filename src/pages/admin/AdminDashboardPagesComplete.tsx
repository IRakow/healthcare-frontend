import AdminLayout from '@/components/layout/AdminLayout'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommandEnhanced'
import { Card } from '@/components/ui/card'
import { BarChart2, ShieldCheck, Cpu, Eye, LayoutDashboard, CalendarCheck, Stethoscope, Megaphone } from 'lucide-react'

export function AdminChartDashboardPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-pink-500" /> Chart & Usage Dashboard
      </h1>
      <Card className="p-4">
        <p className="text-sm mb-1">AI Call Volume: 13,240 this month</p>
        <p className="text-sm mb-1">Top endpoint: /admin/voice-assist</p>
        <p className="text-sm">Usage trend: +12% from last month</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'charts')} context="charts" />
    </AdminLayout>
  )
}

export function AdminComplianceDashboard() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-lime-600" /> Compliance Center
      </h1>
      <Card className="p-4">
        <p className="text-sm mb-1">HIPAA violations: 0 this month ✅</p>
        <p className="text-sm mb-1">Audit interval: 12 hours</p>
        <p className="text-sm">Flagged records: 1 (user access override)</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'compliance')} context="compliance" />
    </AdminLayout>
  )
}

export function AdminSuperPanelPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-fuchsia-600" /> Super Admin Panel
      </h1>
      <Card className="p-4">
        <p className="text-sm mb-1">System Load: 32%</p>
        <p className="text-sm mb-1">Background tasks: 7 running</p>
        <p className="text-sm">Most active module: AI export processor</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'system')} context="system" />
    </AdminLayout>
  )
}

export function AdminVisualInspectorPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-cyan-500" /> Visual Inspector
      </h1>
      <Card className="p-4">
        <p className="text-sm mb-1">Inspect and interact with real-time UI events</p>
        <p className="text-sm mb-1">Listening to frontend logs, anomalies</p>
        <p className="text-sm">Rachel: "Say 'highlight UI errors' to filter visually"</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'ui')} context="ui" />
    </AdminLayout>
  )
}

export function AdminRachelLaunchboard() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6 text-blue-700" /> Rachel Admin Launchboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-green-600" /> Today's Appointments
          </h2>
          <p className="text-sm">18 appointments across 7 providers today</p>
          <p className="text-xs text-muted-foreground">Say "How many appointments today?"</p>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-rose-500" /> Active Providers
          </h2>
          <p className="text-sm">5 providers currently clocked in</p>
          <p className="text-xs text-muted-foreground">Say "Which providers are working?"</p>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-yellow-600" /> AI Shortcuts
          </h2>
          <p className="text-sm">"Remind me to check invoices"<br />"Export today's audit log"</p>
        </Card>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        Rachel: "Try asking me something now — like 'How many providers are live today?' or 'What are the top issues this week?'"
      </div>

      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'launchboard')} context="launchboard" />
    </AdminLayout>
  )
}