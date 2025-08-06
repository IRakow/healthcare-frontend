import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { ShieldAlert, EyeOff, LockKeyhole, BarChart2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Event {
  id: string
  type: 'failed_login' | 'data_access' | 'privilege_escalation'
  user: string
  time: string
  notes?: string
}

export default function AdminSecurityPanel() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const now = new Date()
    setEvents([
      {
        id: 's1',
        type: 'failed_login',
        user: 'ian@admin.com',
        time: new Date(now.getTime() - 1000 * 60 * 2).toISOString(),
        notes: 'Incorrect password entered 3 times.'
      },
      {
        id: 's2',
        type: 'data_access',
        user: 'dr.lee@nova.com',
        time: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        notes: 'Accessed restricted EHR files.'
      }
    ])
  }, [])

  const iconMap = {
    failed_login: <LockKeyhole className="w-5 h-5 text-red-500" />,
    data_access: <EyeOff className="w-5 h-5 text-orange-500" />,
    privilege_escalation: <ShieldAlert className="w-5 h-5 text-yellow-500" />
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-rose-600" /> Security & Access Events
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Card key={event.id} className="p-4 bg-white/90 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              {iconMap[event.type]} {event.user}
            </div>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(event.time), { addSuffix: true })}</p>
            <p className="text-xs text-slate-600 italic">{event.notes}</p>
          </Card>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No recent access threats or anomalies.</p>
        )}
      </div>
    </div>
  )
}