import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ShieldCheck, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { speak } from '@/lib/voice/RachelTTSQueue'

interface Log {
  id: string
  action: string
  user: string
  category: string
  time: string
  status: 'success' | 'warning' | 'error'
  details?: string
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    const entries: Log[] = [
      {
        id: '1',
        action: 'Login Success',
        user: 'ian@admin.com',
        category: 'auth',
        time: new Date().toISOString(),
        status: 'success',
        details: 'Browser: Chrome'
      },
      {
        id: '2',
        action: 'Failed Role Change',
        user: 'staff@clinic.com',
        category: 'security',
        time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        status: 'error',
        details: 'Unauthorized attempt to change role'
      }
    ]
    setLogs(entries)
  }, [])

  const handleVoiceQuery = async (text: string) => {
    if (text.includes('security') || text.includes('breach') || text.includes('threat')) {
      const threats = logs.filter(l => l.status === 'error')
      if (threats.length > 0) {
        speak(`Found ${threats.length} security incident${threats.length > 1 ? 's' : ''}. Most recent: ${threats[0].action} by ${threats[0].user}`)
      } else {
        speak('No security threats or breaches found in recent logs.')
      }
    } else if (text.includes('failed') || text.includes('error')) {
      const errors = logs.filter(l => l.status === 'error')
      speak(`There ${errors.length === 1 ? 'is' : 'are'} ${errors.length} failed attempt${errors.length !== 1 ? 's' : ''} in the logs.`)
    } else if (text.includes('recent') || text.includes('latest')) {
      const latest = logs[0]
      if (latest) {
        speak(`Most recent activity: ${latest.action} by ${latest.user} ${formatDistanceToNow(new Date(latest.time), { addSuffix: true })}`)
      }
    } else if (text.includes('auth') || text.includes('login')) {
      const authLogs = logs.filter(l => l.category === 'auth')
      speak(`Found ${authLogs.length} authentication event${authLogs.length !== 1 ? 's' : ''} in the logs.`)
    } else {
      speak('You can ask about security threats, failed attempts, recent activity, or authentication events.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-blue-600" /> System Audit Logs
      </h1>
      <p className="text-sm text-muted-foreground mb-6">Monitor all sensitive activity and security incidents.</p>

      <div className="space-y-4">
        {logs.map(log => (
          <Card key={log.id} className="p-4 rounded-xl bg-white/90 border border-gray-200">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.user} • {formatDistanceToNow(new Date(log.time), { addSuffix: true })}</p>
                {log.details && <p className="text-xs text-gray-500 italic">{log.details}</p>}
              </div>
              <div className="text-right">
                <Badge variant={log.status === 'success' ? 'default' : log.status === 'warning' ? 'secondary' : 'destructive'}>{log.status}</Badge>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {log.category.toUpperCase()}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground italic flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400" /> No recent log activity.
          </p>
        )}
      </div>
      <AdminAssistantBar onAsk={handleVoiceQuery} context="audit" />
    </div>
  )
}