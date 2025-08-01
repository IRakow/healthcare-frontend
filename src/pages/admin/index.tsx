import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { AssistantBar } from '@/components/ai/AssistantBar'
import { AdminAuditLogPanel } from '@/components/admin/AdminAuditLogPanel'
import { EmployerOnboardingPanel } from '@/components/admin/EmployerOnboardingPanel'
import { MonthlyInvoicePanel } from '@/components/admin/MonthlyInvoicePanel'
import { EmployerInvoiceViewer } from '@/components/admin/EmployerInvoiceViewer'
import { VoiceBrandingSelector } from '@/components/admin/VoiceBrandingSelector'
import { AuditLogSearch } from '@/components/admin/AuditLogSearch'
import { FeatureTogglePanel } from '@/components/admin/FeatureTogglePanel'
import { AdminAiActivityFeed } from '@/components/admin/AdminAiActivityFeed'
import { AdminTimeline } from '@/components/admin/AdminTimeline'
import { AdminEmployerTrends } from '@/components/admin/AdminEmployerTrends'
import { AdminFeatureUsagePanel } from '@/components/admin/AdminFeatureUsagePanel'
import { AiUsageChart } from '@/components/admin/AiUsageChartArea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getAdminStats } from '@/lib/publicDataService'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeEmployers: 0, totalRevenue: 0 })

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [])

  return (
    <AdminLayout>
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[
          { title: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'text-sky-700' },
          { title: 'Active Employers', value: stats.activeEmployers.toLocaleString(), color: 'text-emerald-700' },
          { title: 'Monthly Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-indigo-700' },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 shadow-md hover:shadow-sky-200 transition-all">
              <CardContent className="p-6">
                <p className={`text-lg font-semibold ${card.color}`}>{card.title}</p>
                <p className="text-4xl font-bold mt-2">{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabbed Modules */}
      <div className="px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="sticky top-0 z-10 backdrop-blur-md bg-white/60 border border-slate-200 mb-6 p-2 rounded-xl shadow">
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="ai">🧠 AI Logs</TabsTrigger>
              <TabsTrigger value="employers">🏢 Employers</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-10">
              <AiUsageChart />
              <AdminEmployerTrends />
              <AdminFeatureUsagePanel />
              <AuditLogSearch />
              <AdminTimeline />
            </TabsContent>

            <TabsContent value="ai" className="space-y-10">
              <AdminAiActivityFeed />
              <AdminAuditLogPanel />
            </TabsContent>

            <TabsContent value="employers" className="space-y-10">
              <EmployerOnboardingPanel />
              <MonthlyInvoicePanel />
              <EmployerInvoiceViewer />
            </TabsContent>

            <TabsContent value="settings" className="space-y-10">
              <VoiceBrandingSelector />
              <FeatureTogglePanel />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <AssistantBar />
    </AdminLayout>
  )
}