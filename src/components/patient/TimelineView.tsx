import { useEffect, useState } from 'react'
import { getPatientTimelineData, TimelineItem } from '@/services/timelineService'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Props {
  patientId: string
}

export default function TimelineViewer({ patientId }: Props) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTimeline() {
      setLoading(true)
      const data = await getPatientTimelineData(patientId)
      setTimeline(data)
      setLoading(false)
    }
    loadTimeline()
  }, [patientId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-blue-500">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        <span>Loading timeline...</span>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No timeline entries yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-4 py-6">
      {timeline.map(item => (
        <Card key={item.id} className="bg-white/80 backdrop-blur border border-white/20 rounded-xl p-4 shadow">
          <div className="text-sm text-gray-500">{item.timestamp}</div>
          <div className="text-base font-semibold text-gray-800">{item.title}</div>
          <div className="text-sm text-gray-700 mt-1">{item.description}</div>
        </Card>
      ))}
    </div>
  )
}
