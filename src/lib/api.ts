import { useEffect, useState } from 'react'
import { getPatientTimelineData, TimelineItem } from '@/services/timelineService'

export default function TimelineView({ patientId }: { patientId: string }) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPatientTimelineData(patientId).then(data => {
      setTimeline(data)
      setLoading(false)
    })
  }, [patientId])

  if (loading) return <p>Loading timeline...</p>
  if (timeline.length === 0) return <p>No timeline entries yet.</p>

  return (
    <ul>
      {timeline.map(item => (
        <li key={item.id}>
          <strong>{item.title}</strong> – {item.timestamp}
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  )
}
