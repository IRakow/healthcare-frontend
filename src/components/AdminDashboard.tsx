import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent } from '@/components/ui/card'
import { AssistantBar } from '@/components/ai/AssistantBar'
import { getAdminStats, getEmployerBreakdown, getAiAuditPreview } from '@/lib/publicDataService'
import { AdminAuditLogPanel } from '@/components/admin/AdminAuditLogPanel'
import { AiLogSearchPanel } from '@/components/admin/AiLogSearchPanel'
import { EmployerOnboardingPanel } from '@/components/admin/EmployerOnboardingPanel'
import { MonthlyInvoicePanel } from '@/components/admin/MonthlyInvoicePanel'
import { AiUsageChart } from '@/components/admin/AiUsageChart'
import { EmployerInvoiceViewer } from '@/components/admin/EmployerInvoiceViewer'
import { VoiceBrandingSelector } from '@/components/admin/VoiceBrandingSelector'
import { AuditLogSearch } from '@/components/admin/AuditLogSearch'
import { FeatureTogglePanel } from '@/components/admin/FeatureTogglePanel'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeEmployers: 0, totalRevenue: 0 })
  const [employers, setEmployers] = useState<any[]>([])
  const [aiLogs, setAiLogs] = useState<any[]>([])

  useEffect(() => {
    getAdminStats().then(setStats)
    getEmployerBreakdown().then(setEmployers)
    getAiAuditPreview().then(setAiLogs)
  }, [])

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-sky-700">Total Users</p>
            <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-teal-700">Active Employers</p>
            <p className="text-4xl font-bold mt-2">{stats.activeEmployers}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-indigo-700">Revenue</p>
            <p className="text-4xl font-bold mt-2">${stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* EMPLOYER BILLING PANEL */}
      <div className="p-6">
        <Card className="glass-card">
          <CardContent>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Top Employers by Revenue</h2>
            <ul className="space-y-3">
              {employers.map((emp, idx) => (
                <li key={idx} className="flex justify-between border-b border-slate-200 pb-2">
                  <span>{emp.name}</span>
                  <span className="text-sky-700 font-semibold">${emp.revenue.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* AI ACTIVITY PANEL */}
      <div className="p-6">
        <Card className="glass-card">
          <CardContent>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent AI Interactions</h2>
            <ul className="space-y-3">
              {aiLogs.map((log, i) => (
                <li key={i} className="text-sm text-slate-700">
                  <strong>{log.user}</strong> asked <em>"{log.input}"</em> → Response length: {log.output.length} chars
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* USER ACTIVITY PANEL */}
      <div className="p-6">
        <Card className="glass-card">
          <CardContent>
            <h2 className="text-lg font-bold text-slate-800 mb-4">User Activity</h2>
            <p>New signups this week: <strong className="text-green-700">+34</strong></p>
            <p>Logins in past 24h: <strong className="text-blue-700">142</strong></p>
            <p>Churn risk users: <strong className="text-red-600">6</strong></p>
          </CardContent>
        </Card>
      </div>

      {/* SYSTEM LOG SUMMARY */}
      <div className="p-6">
        <Card className="glass-card">
          <CardContent>
            <h2 className="text-lg font-bold text-slate-800 mb-4">System Log Summary</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✅ Employer "Techfinity" added by Owner ID 103</li>
              <li>🧠 Gemini AI failed for patient ID 2221 (timeout)</li>
              <li>💬 New message from patient ID 901 to provider ID 88</li>
              <li>📁 3 new uploads added to patient file 677</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Additional Admin Panels */}
      <div className="px-6">
        <AiLogSearchPanel />
        <AuditLogSearch />
        <AiUsageChart />
        <AdminAuditLogPanel />
        <EmployerOnboardingPanel />
        <EmployerInvoiceViewer />
        <VoiceBrandingSelector />
        <FeatureTogglePanel />
        <MonthlyInvoicePanel />
      </div>

      <div className="pb-24" />

      <AssistantBar />
    </AdminLayout>
  )
}
