import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import Alert from '@/components/ui/alert'
import { formatDistanceToNow } from 'date-fns'

interface TimelineEvent {
  id: string
  type: string
  label: string
  created_at: string
  data?: any
}

export default function TimelineViewer({ patientId }: { patientId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTimeline() {
      const { data, error } = await supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading timeline:', error.message)
        setEvents([])
      } else {
        setEvents(data || [])
      }
      setLoading(false)
    }

    fetchTimeline()
  }, [patientId])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">📜 Patient Timeline</h1>

      {loading && <Alert type="info" title="Loading" message="Loading timeline data..." />}

      {!loading && events.length === 0 && (
        <Alert type="warning" title="No Timeline Entries" message="No events found for this patient yet." />
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="bg-white/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wide font-medium">
                {event.type}
              </span>
            </div>

            <p className="text-base text-gray-800 font-semibold mb-1">{event.label}</p>

            {event.data && (
              <pre className="text-xs text-gray-600 bg-white/20 rounded p-2 overflow-auto max-h-40">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
