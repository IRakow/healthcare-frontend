import AdminLayout from '@/components/layout/AdminLayout'
import { AssistantBar } from '@/components/ai/AssistantBar'
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
import { AdminNotesPanel } from '@/components/admin/AdminNotesPanel'
import { AdminPdfExportPanel } from '@/components/admin/AdminPdfExportPanel'
import { AdminCustomReportPanel } from '@/components/admin/AdminCustomReportPanel'
import { AdminChartBuilder } from '@/components/admin/AdminChartBuilder'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="px-6 pb-24">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="sticky top-0 z-10 backdrop-blur-md bg-gray-800/80 border border-slate-700 mb-6 p-2 rounded-xl shadow text-white">
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
            <div className="flex justify-end pt-10">
              <AssistantBar />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-10">
            <AdminAiActivityFeed />
            <AdminAuditLogPanel />
            <div className="flex justify-end pt-10">
              <AssistantBar />
            </div>
          </TabsContent>

          <TabsContent value="employers" className="space-y-10">
            <EmployerOnboardingPanel />
            <MonthlyInvoicePanel />
            <EmployerInvoiceViewer />
            <div className="flex justify-end pt-10">
              <AssistantBar />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-10">
            <VoiceBrandingSelector />
            <FeatureTogglePanel />
            <AdminPdfExportPanel />
            <AdminCustomReportPanel />
            <AdminChartBuilder />
            <AdminNotesPanel />
            <div className="flex justify-end pt-10">
              <AssistantBar />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}