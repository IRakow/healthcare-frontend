import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Section } from '@/components/ui/Section'
import { GlassCard } from '@/components/ui/GlassCard'
import { Users, FileText, ToggleLeft, BarChart, DollarSign, Bot, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Chart from '@/components/visual/Chart'

export default function AdminOwnerPanels() {
  const [employers, setEmployers] = useState<any[]>([])
  const [revenue, setRevenue] = useState<number>(0)
  const [invoicesDue, setInvoicesDue] = useState<number>(0)
  const [aiLogs, setAiLogs] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: empData } = await supabase.from('employers').select('*')
      const { data: invData } = await supabase.from('employer_invoices').select('*')
      const { data: aiData } = await supabase.from('conversation_insights').select('*').order('created_at', { ascending: false }).limit(3)

      setEmployers(empData || [])
      setInvoicesDue(invData?.filter(inv => inv.status === 'pending').length || 0)
      setRevenue(
        invData?.filter(inv => inv.status === 'paid')
        .reduce((acc, curr) => acc + (curr.total_due || 0), 0) || 0
      )
      setAiLogs(aiData || [])
    }
    fetchData()
  }, [])

  const exportEmployersCSV = () => {
    const header = 'Name,User Count,Plan\n'
    const rows = employers.map(emp => `${emp.name},${emp.user_count || ''},${emp.plan_tier || ''}`).join('\n')
    const csv = header + rows
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employers.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAiLogCSV = () => {
    const header = 'Timestamp,Input\n'
    const rows = aiLogs.map(log => `${log.created_at},"${log.input?.replace(/"/g, '""') || ''}"`).join('\n')
    const csv = header + rows
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ai_audit_logs.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8 p-6">
      <Section title="🏢 Employer Dashboard" icon={Users} description="View active employers and plan stats">
        <GlassCard className="space-y-2 text-white text-sm">
          {employers.map((emp) => (
            <p key={emp.id}>{emp.name}: {emp.user_count || '—'} users • {emp.plan_tier || 'Custom'} Plan</p>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={exportEmployersCSV}>Export Employer List</Button>
        </GlassCard>
      </Section>

      <Section title="💵 Billing Overview" icon={DollarSign} description="Live billing totals and invoice history">
        <GlassCard className="text-white space-y-1 text-sm">
          <p>💳 Total Revenue: <strong>${revenue.toLocaleString()}</strong></p>
          <p>🧾 Outstanding Invoices: {invoicesDue}</p>
          <p>📅 Next Invoice Run: August 1</p>
          <Button variant="outline" className="mt-2 w-full">View All Invoices</Button>
        </GlassCard>
      </Section>

      <Section title="📊 System Usage Charts" icon={BarChart} description="Visual overview of system trends">
        <GlassCard className="bg-background text-white">
          <Chart />
        </GlassCard>
      </Section>

      <Section title="🕵️ AI Audit Logs" icon={FileText} description="Review system-level assistant actions">
        <GlassCard className="text-white text-sm space-y-1">
          {aiLogs.map((log) => (
            <p key={log.id}>📍 {new Date(log.created_at).toLocaleDateString()} – "{log.input?.slice(0, 40)}..."</p>
          ))}
          <Button variant="outline" className="mt-2 w-full" onClick={exportAiLogCSV}>Download Full Log</Button>
        </GlassCard>
      </Section>

      <Section title="🧩 Feature Toggles" icon={ToggleLeft} description="Enable or disable platform modules">
        <GlassCard className="text-white text-sm space-y-1">
          {[
            { label: 'AI Assistant', enabled: true },
            { label: 'Video Visits', enabled: true },
            { label: 'Food + Vitals Tracking', enabled: true },
            { label: 'Family Member Add-ons', enabled: true },
            { label: 'Billing + Employer Plans', enabled: true },
            { label: 'ElevenLabs + Deepgram Voice', enabled: true },
          ].map((feature, index) => (
            <div key={index} className="flex items-center justify-between">
              <span>{feature.enabled ? '✅' : '❌'} {feature.label}</span>
              <Button size="sm" variant="outline">{feature.enabled ? 'Disable' : 'Enable'}</Button>
            </div>
          ))}
        </GlassCard>
      </Section>

      <Section title="🤖 Gemini + Voice Activity" icon={Bot} description="Track AI engine performance + volume">
        <GlassCard className="text-white space-y-1 text-sm">
          <p>Gemini Requests (7 days): 582</p>
          <p>ElevenLabs Playback: 427 sessions</p>
          <p>Deepgram Transcriptions: 341 successful</p>
        </GlassCard>
      </Section>

      <Section title="📈 Visual Insights" icon={LayoutDashboard} description="Text-based visual blocks for context and insight">
        <GlassCard className="text-white space-y-2 text-sm">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white p-4 rounded-xl shadow">
            <p className="font-semibold text-lg">This month's revenue is strong</p>
            <p>Total paid invoices across all employers: <strong>${revenue.toLocaleString()}</strong></p>
          </div>
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white p-4 rounded-xl shadow">
            <p className="font-semibold text-lg">AI adoption trending up</p>
            <p>{aiLogs.length} interactions in the past 30 days with assistant-generated logs appearing more frequently in timelines.</p>
          </div>
          <div className="bg-gradient-to-r from-rose-600 to-pink-500 text-white p-4 rounded-xl shadow">
            <p className="font-semibold text-lg">Actionable Alert</p>
            <p>{invoicesDue} outstanding invoices need attention before the next billing cycle (Aug 1).</p>
          </div>
        </GlassCard>
      </Section>
    </div>
  )
}