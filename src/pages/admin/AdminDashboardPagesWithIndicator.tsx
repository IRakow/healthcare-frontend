import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useEffect } from 'react'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import { handleAdminCommand } from '@/lib/voice/handleAdminCommandEnhanced'
import { Card } from '@/components/ui/card'
import { BarChart2, ShieldCheck, Cpu, Eye, LayoutDashboard, CalendarCheck, Stethoscope, Megaphone } from 'lucide-react'

const cardClass =
  'p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[120px]'
const sectionTitleClass =
  'text-2xl font-bold mb-4 flex items-center gap-2 text-slate-800 sm:text-3xl'
const sectionGridClass =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'

export function AdminChartDashboardPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className={sectionTitleClass}>
        <BarChart2 className="w-6 h-6 text-pink-500" /> Chart & Usage Dashboard
      </h1>
      <Card className={cardClass}>
        <p className="text-sm mb-1">AI Call Volume: 13,240 this month</p>
        <p className="text-sm mb-1">Top endpoint: /admin/voice-assist</p>
        <p className="text-sm">Usage trend: +12% from last month</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'charts')} context="charts" />
      <div className="mt-8 sm:hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const value = e.currentTarget.query.value.trim()
            if (value) handleAdminCommand(value, 'launchboard')
          }}
          className="flex gap-2"
        >
          <input
            name="query"
            className="flex-1 px-4 py-2 rounded-md border text-sm"
            placeholder="Type a command instead..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >Ask</button>
        </form>
      </div>
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl flex items-center gap-3 px-4 py-2 bg-white border shadow-xl rounded-full sm:hidden">
        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm text-slate-700">Rachel is listening...</span>
      </div>
    </div>
  )
}

export function AdminComplianceDashboard() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className={sectionTitleClass}>
        <ShieldCheck className="w-6 h-6 text-lime-600" /> Compliance Center
      </h1>
      <Card className={cardClass}>
        <p className="text-sm mb-1">HIPAA violations: 0 this month ✅</p>
        <p className="text-sm mb-1">Audit interval: 12 hours</p>
        <p className="text-sm">Flagged records: 1 (user access override)</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'compliance')} context="compliance" />
    </div>
  )
}

export function AdminSuperPanelPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className={sectionTitleClass}>
        <Cpu className="w-6 h-6 text-fuchsia-600" /> Super Admin Panel
      </h1>
      <Card className={cardClass}>
        <p className="text-sm mb-1">System Load: 32%</p>
        <p className="text-sm mb-1">Background tasks: 7 running</p>
        <p className="text-sm">Most active module: AI export processor</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'system')} context="system" />
    </div>
  )
}

export function AdminVisualInspectorPage() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className={sectionTitleClass}>
        <Eye className="w-6 h-6 text-cyan-500" /> Visual Inspector
      </h1>
      <Card className={cardClass}>
        <p className="text-sm mb-1">Inspect and interact with real-time UI events</p>
        <p className="text-sm mb-1">Listening to frontend logs, anomalies</p>
        <p className="text-sm">Rachel: "Say 'highlight UI errors' to filter visually"</p>
      </Card>
      <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'ui')} context="ui" />
    </div>
  )
}

export function AdminRachelLaunchboard() {
  const { startListening } = useAdminVoiceCapture()
  useEffect(() => startListening(), [])

  return (
    <div className="p-6">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 flex items-center gap-3">
        <LayoutDashboard className="w-7 h-7 text-blue-700" /> Rachel Admin Launchboard
      </h1>

      <div className={sectionGridClass}>
        <Card className={cardClass}>
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-green-600" /> Today's Appointments
          </h2>
          <p className="text-sm">18 appointments across 7 providers today</p>
          <p className="text-xs text-muted-foreground">Say "How many appointments today?"</p>
        </Card>

        <Card className={cardClass}>
          <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-rose-500" /> Active Providers
          </h2>
          <p className="text-sm">5 providers currently clocked in</p>
          <p className="text-xs text-muted-foreground">Say "Which providers are working?"</p>
        </Card>

        <Card className={cardClass}>
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
    </div>
  )
}