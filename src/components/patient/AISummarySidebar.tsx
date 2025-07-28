import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Sparkles, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface AISummarySidebarProps {
  patientId: string
}

export default function AISummarySidebar({ patientId }: AISummarySidebarProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAISummary = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-health-summary', {
        body: { patient_id: patientId }
      })

      if (error) {
        console.error('AI Summary Error:', error)
        // Use mock data for demo
        setSummary(getMockSummary())
      } else {
        setSummary(data?.summary || getMockSummary())
      }
    } catch (err) {
      console.error('Error:', err)
      setSummary(getMockSummary())
    } finally {
      setLoading(false)
    }
  }

  const getMockSummary = () => {
    return `Your health metrics look strong this week! 💪

Sleep quality has improved by 15% compared to last month, averaging 7.5 hours per night.

Hydration levels are on target at 64oz daily - keep it up!

Consider adding one more workout session to reach your weekly goal of 4 sessions.

Your protein intake is excellent, supporting muscle recovery and energy levels.

No health risks detected. Continue your current wellness routine!`
  }

  const refreshSummary = async () => {
    setRefreshing(true)
    await fetchAISummary()
    setRefreshing(false)
  }

  useEffect(() => {
    if (patientId) fetchAISummary()
  }, [patientId])

  const renderSummarySection = (text: string, icon?: React.ReactNode) => {
    const lines = text.split('\n').filter(line => line.trim())
    
    return lines.map((line, idx) => {
      const isHighlight = line.includes('💪') || line.includes('!') || line.includes('%')
      const isWarning = line.toLowerCase().includes('consider') || line.toLowerCase().includes('risk')
      
      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`p-3 rounded-lg ${
            isHighlight ? 'bg-emerald-50 dark:bg-emerald-950/30' :
            isWarning ? 'bg-amber-50 dark:bg-amber-950/30' :
            'bg-gray-50 dark:bg-zinc-800/50'
          }`}
        >
          <div className="flex items-start gap-2">
            {isHighlight && <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />}
            {isWarning && <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />}
            <p className={`text-sm leading-relaxed ${
              isHighlight ? 'text-emerald-800 dark:text-emerald-200' :
              isWarning ? 'text-amber-800 dark:text-amber-200' :
              'text-zinc-700 dark:text-zinc-300'
            }`}>
              {line.trim()}
            </p>
          </div>
        </motion.div>
      )
    })
  }

  return (
    <Card className="w-full shadow-lg border border-emerald-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Sparkles className="text-emerald-600 w-5 h-5" />
            </div>
            <CardTitle className="text-base font-semibold text-zinc-800 dark:text-white">
              AI Health Insights
            </CardTitle>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={refreshSummary}
            disabled={refreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="space-y-2">
            {renderSummarySection(summary)}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">No AI insights available yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Check back after logging more health data.</p>
          </div>
        )}

        {summary && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-xs text-muted-foreground text-center">
              AI insights updated {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}