import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { TestTube2, FileBarChart2, AlertTriangle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Lab {
  id: string
  test_name: string
  date: string
  lab_name: string
  status: 'normal' | 'abnormal' | 'pending'
  notes?: string
}

interface PatientLabViewerProps {
  labs?: Lab[]
}

interface LabListProps {
  labs: Lab[]
  icon: React.ReactNode
}

export default function PatientLabViewer({ labs = [] }: PatientLabViewerProps) {
  const [activeTab, setActiveTab] = useState('recent')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [activeTab])

  const recentLabs = labs.filter(l => l.status === 'normal')
  const flaggedLabs = labs.filter(l => l.status === 'abnormal')
  const pendingLabs = labs.filter(l => l.status === 'pending')

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-xl border border-emerald-100 dark:border-zinc-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <TestTube2 className="text-emerald-500" />
          <CardTitle>Lab Results</CardTitle>
        </div>
        <TabsList className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
          <TabsTrigger value="recent" onClick={() => setActiveTab('recent')}>Recent</TabsTrigger>
          <TabsTrigger value="flagged" onClick={() => setActiveTab('flagged')}>Flagged</TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setActiveTab('pending')}>Pending</TabsTrigger>
        </TabsList>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="p-6 text-center animate-pulse text-muted-foreground">Loading...</div>
        ) : (
          <Tabs value={activeTab} className="pt-4">
            <TabsContent value="recent">
              <LabList labs={recentLabs} icon={<FileBarChart2 className="text-blue-500" />} />
            </TabsContent>
            <TabsContent value="flagged">
              <LabList labs={flaggedLabs} icon={<AlertTriangle className="text-red-500" />} />
            </TabsContent>
            <TabsContent value="pending">
              <LabList labs={pendingLabs} icon={<Clock className="text-yellow-500" />} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

function LabList({ labs, icon }: LabListProps) {
  if (!labs.length) return <div className="p-4 text-muted-foreground text-sm">No records found.</div>

  return (
    <ul className="space-y-3">
      {labs.map((lab) => (
        <li key={lab.id} className="border p-4 rounded-xl shadow-sm bg-white dark:bg-zinc-900">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <div className="font-medium text-sm">{lab.test_name}</div>
                <div className="text-xs text-muted-foreground">{lab.date} • {lab.lab_name}</div>
              </div>
            </div>
            <Badge className={cn('text-xs', {
              'bg-green-100 text-green-800': lab.status === 'normal',
              'bg-red-100 text-red-800': lab.status === 'abnormal',
              'bg-yellow-100 text-yellow-900': lab.status === 'pending',
            })}>{lab.status}</Badge>
          </div>
          {lab.notes && <p className="text-xs mt-2 text-zinc-600 dark:text-zinc-300">{lab.notes}</p>}
        </li>
      ))}
    </ul>
  )
}