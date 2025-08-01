import { useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollTopFAB } from '@/components/ui/ScrollTopFAB'
import { EmployerSelector } from '@/components/admin/EmployerSelector'
import {
  AdminFeatureTogglePanel,
  AdminEmployerTrends,
  AdminAiActivityFeed,
  AdminTimeline,
  AdminPinnedEmployers,
  AdminAuditTrailViewer,
  AdminAiSummaryGenerator,
  AdminBroadcastPanel
} from '@/components/admin/panels'

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('system')

  return (
    <AdminLayout>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold text-sky-900">Admin SuperPanel</h1>
        <p className="text-gray-500 text-sm">Full visibility into AI, employers, and operations</p>
        <EmployerSelector className="max-w-xs" />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-2 bg-white/70 p-2 rounded-xl shadow border w-full">
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="ai">AI Activity</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
          <TabsTrigger value="tools">Admin Tools</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {tab === 'system' && (
              <>
                <AdminFeatureTogglePanel />
                <AdminTimeline />
              </>
            )}
            {tab === 'ai' && (
              <>
                <AdminAiActivityFeed />
                <AdminAiSummaryGenerator />
              </>
            )}
            {tab === 'employers' && (
              <>
                <AdminEmployerTrends />
                <AdminPinnedEmployers />
              </>
            )}
            {tab === 'tools' && (
              <>
                <AdminAuditTrailViewer />
                <AdminBroadcastPanel />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <ScrollTopFAB />
    </AdminLayout>
  )
}