import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { AssistantBar } from '@/components/ai/AssistantBar'
import { AdminAuditLogPanel } from '@/components/admin/AdminAuditLogPanel'
import { EmployerOnboardingPanel } from '@/components/admin/EmployerOnboardingPanel'
import { MonthlyInvoicePanel } from '@/components/admin/MonthlyInvoicePanel'
import { AiUsageChart } from '@/components/admin/AiUsageChart'
import { EmployerInvoiceViewer } from '@/components/admin/EmployerInvoiceViewer'
import { VoiceBrandingSelector } from '@/components/admin/VoiceBrandingSelector'
import { AuditLogSearch } from '@/components/admin/AuditLogSearch'
import { FeatureTogglePanel } from '@/components/admin/FeatureTogglePanel'
import { Card, CardContent } from '@/components/ui/card'
import { getAdminStats } from '@/lib/publicDataService'
import { motion } from 'framer-motion'

const fadeSlide = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, activeEmployers: 0, totalRevenue: 0 })

  useEffect(() => {
    getAdminStats().then(setStats)
  }, [])

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[ 
          { title: 'Total Users', value: stats.totalUsers.toLocaleString(), color: 'text-sky-700' },
          { title: 'Active Employers', value: stats.activeEmployers.toLocaleString(), color: 'text-emerald-700' },
          { title: 'Monthly Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: 'text-indigo-700' },
        ].map((card, idx) => (
          <motion.div key={idx} {...fadeSlide}>
            <Card className="glass-card hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <p className={`text-lg font-semibold ${card.color}`}>{card.title}</p>
                <p className="text-4xl font-bold mt-2">{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="px-6 space-y-10 pb-24">
        {[ 
          <AiUsageChart />,
          <AuditLogSearch />,
          <AdminAuditLogPanel />,
          <EmployerOnboardingPanel />,
          <MonthlyInvoicePanel />,
          <EmployerInvoiceViewer />,
          <VoiceBrandingSelector />,
          <FeatureTogglePanel />
        ].map((Component, idx) => (
          <motion.div key={idx} {...fadeSlide}>{Component}</motion.div>
        ))}
      </div>

      <AssistantBar />
    </AdminLayout>
  )
}
