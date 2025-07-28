import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TimelineItem } from '@/components/timeline/TimelineItem'
import { getPatientTimelineData } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, FileText, Stethoscope, TestTube, MessageSquare, Upload, CalendarDays } from 'lucide-react'

interface TimelineData {
  id: string
  type: 'note' | 'encounter' | 'lab' | 'message' | 'upload' | 'appointment'
  timestamp: string
  title: string
  description: string
}

interface PatientTimelineViewerProps {
  patientId: string
}

const ICONS = {
  note: <FileText className="text-sky-500" />,
  encounter: <Stethoscope className="text-emerald-500" />,
  lab: <TestTube className="text-purple-500" />,
  message: <MessageSquare className="text-orange-500" />,
  upload: <Upload className="text-pink-500" />,
  appointment: <CalendarDays className="text-blue-400" />,
}

export default function PatientTimelineViewer({ patientId }: PatientTimelineViewerProps) {
  const [timeline, setTimeline] = useState<TimelineData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const load = async () => {
      const data = await getPatientTimelineData(patientId)
      setTimeline(data)
      setIsLoading(false)
    }
    load()
  }, [patientId])

  const filtered = activeTab === 'all' ? timeline : timeline.filter(t => t.type === activeTab)

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Patient Timeline</CardTitle>
        <TabsList className="bg-white dark:bg-zinc-900 rounded-xl">
          <TabsTrigger value="all" onClick={() => setActiveTab('all')}>All</TabsTrigger>
          <TabsTrigger value="note" onClick={() => setActiveTab('note')}>Notes</TabsTrigger>
          <TabsTrigger value="encounter" onClick={() => setActiveTab('encounter')}>Encounters</TabsTrigger>
          <TabsTrigger value="lab" onClick={() => setActiveTab('lab')}>Labs</TabsTrigger>
          <TabsTrigger value="message" onClick={() => setActiveTab('message')}>Messages</TabsTrigger>
          <TabsTrigger value="upload" onClick={() => setActiveTab('upload')}>Files</TabsTrigger>
        </TabsList>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800" />)}
          </div>
        ) : (
          <Tabs value={activeTab} className="w-full">
            <TabsContent value={activeTab} className="mt-0">
              <ul className="space-y-4">
                {filtered.map((item) => (
                  <TimelineItem
                    key={item.id}
                    icon={ICONS[item.type] || <Clock className="text-muted" />}
                    timestamp={item.timestamp}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}