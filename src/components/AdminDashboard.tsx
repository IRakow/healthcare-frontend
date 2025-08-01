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
import { AdminPdfExportPanel } from '@/components/admin/AdminPdfExportPanel'
import { AdminCustomReportPanel } from '@/components/admin/AdminCustomReportPanel'
import { AdminChartBuilder } from '@/components/admin/AdminChartBuilder'
import { AdminNotesPanel } from '@/components/admin/AdminNotesPanel'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getAdminStats } from '@/lib/publicDataService'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeEmployers: 0, totalRevenue: 0 })

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [])

  const staggered = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: i * 0.1 }
  })

  return (
    <AdminLayout>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[
          { title: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'text-sky-700' },
          { title: 'Active Employers', value: stats.activeEmployers.toLocaleString(), color: 'text-emerald-700' },
          { title: 'Monthly Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-indigo-700' },
        ].map((card, idx) => (
          <motion.div key={idx} {...staggered(idx)}>
            <Card className="rounded-2xl bg-white/30 backdrop-blur-md border border-white/50 shadow-md hover:shadow-sky-200 transition-all">
              <CardContent className="p-6">
                <p className={`text-lg font-semibold ${card.color}`}>{card.title}</p>
                <p className="text-4xl font-bold mt-2">{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabbed Panel */}
      <div className="px-6 pb-32 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="sticky top-0 z-10 backdrop-blur-md bg-white/60 border border-slate-200 mb-6 p-2 rounded-xl shadow flex flex-wrap gap-2">
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="ai">🧠 AI Logs</TabsTrigger>
              <TabsTrigger value="employers">🏢 Employers</TabsTrigger>
              <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-10">
              <motion.div {...staggered(0)}><AiUsageChart /></motion.div>
              <motion.div {...staggered(1)}><AdminEmployerTrends /></motion.div>
              <motion.div {...staggered(2)}><AdminFeatureUsagePanel /></motion.div>
              <motion.div {...staggered(3)}><AuditLogSearch /></motion.div>
              <motion.div {...staggered(4)}><AdminTimeline /></motion.div>
              <div className="flex justify-end pt-10">
                <AssistantBar />
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-10">
              <motion.div {...staggered(0)}><AdminAiActivityFeed /></motion.div>
              <motion.div {...staggered(1)}><AdminAuditLogPanel /></motion.div>
            </TabsContent>

            <TabsContent value="employers" className="space-y-10">
              <motion.div {...staggered(0)}><EmployerOnboardingPanel /></motion.div>
              <motion.div {...staggered(1)}><MonthlyInvoicePanel /></motion.div>
              <motion.div {...staggered(2)}><EmployerInvoiceViewer /></motion.div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-10">
              <motion.div {...staggered(0)}><VoiceBrandingSelector /></motion.div>
              <motion.div {...staggered(1)}><FeatureTogglePanel /></motion.div>
              <motion.div {...staggered(2)}><AdminPdfExportPanel /></motion.div>
              <motion.div {...staggered(3)}><AdminCustomReportPanel /></motion.div>
              <motion.div {...staggered(4)}><AdminChartBuilder /></motion.div>
              <motion.div {...staggered(5)}><AdminNotesPanel /></motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
