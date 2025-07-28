import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PatientLayout from '@/components/layout/PatientLayout'
import PatientHealthDashboard from '@/components/patient/PatientHealthDashboard'
import AISummarySidebar from '@/components/patient/AISummarySidebar'
import HealthCharts from '@/components/patient/HealthCharts'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Download, Share2, Calendar } from 'lucide-react'

export default function PatientHealthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const patientId = user?.id

  if (loading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your health data...</p>
          </div>
        </div>
      </PatientLayout>
    )
  }

  if (!patientId) {
    return (
      <PatientLayout>
        <div className="text-center py-10 text-muted-foreground">
          Unable to load health data. Please try again.
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-10 space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">My Health Overview</h1>
            <p className="text-muted-foreground mt-1">Track your vitals, activities, and wellness trends</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Calendar className="w-4 h-4 mr-2" />
              Log Today
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Vitals dashboard */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PatientHealthDashboard patientId={patientId} />
          </motion.div>

          {/* Right column: AI Insights */}
          <motion.div 
            className="w-full lg:max-w-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AISummarySidebar patientId={patientId} />
          </motion.div>
        </div>

        <Separator className="my-8" />

        {/* Bottom section: Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <HealthCharts patientId={patientId} />
        </motion.div>

        {/* Quick Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Sleep Tip</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Try to maintain a consistent sleep schedule, even on weekends, to improve your sleep quality.
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Hydration Goal</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Aim for at least 8 glasses (64 oz) of water daily. Your body will thank you!
            </p>
          </div>
          
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Activity Boost</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Take a 5-minute walk every hour to boost your daily step count and energy levels.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </PatientLayout>
  )
}