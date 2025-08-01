import { useState } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/layout/AdminLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AdminAuditLogPanel } from '@/components/admin/AdminAuditLogPanel'
import { EmployerOnboardingPanel } from '@/components/admin/EmployerOnboardingPanel'
import { MonthlyInvoicePanel } from '@/components/admin/MonthlyInvoicePanel'
import { EmployerInvoiceViewer } from '@/components/admin/EmployerInvoiceViewer'
import { VoiceBrandingSelector } from '@/components/admin/VoiceBrandingSelector'
import { FeatureTogglePanel } from '@/components/admin/FeatureTogglePanel'
import { AdminAiActivityFeed } from '@/components/admin/AdminAiActivityFeed'
import { AdminTimeline } from '@/components/admin/AdminTimeline'
import { AdminEmployerTrends } from '@/components/admin/AdminEmployerTrends'
import { AdminFeatureUsagePanel } from '@/components/admin/AdminFeatureUsagePanel'
import { AiUsageChart } from '@/components/admin/AiUsageChartArea'
import { AuditLogSearch } from '@/components/admin/AuditLogSearch'
import { AdminPdfExportPanel } from '@/components/admin/AdminPdfExportPanel'
import { AdminCustomReportPanel } from '@/components/admin/AdminCustomReportPanel'
import { AdminChartBuilder } from '@/components/admin/AdminChartBuilder'
import { AdminNotesPanel } from '@/components/admin/AdminNotesPanel'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-sky-900">Admin Dashboard</h1>
          <p className="text-gray-500">Comprehensive platform management and analytics</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai">AI Activity</TabsTrigger>
            <TabsTrigger value="employers">Employers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
            <AdminPdfExportPanel />
            <AdminCustomReportPanel />
            <AdminChartBuilder />
            <AdminNotesPanel />
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  )
}