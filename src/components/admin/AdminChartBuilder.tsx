import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart2 } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

const data = [
  { day: 'Mon', visits: 23 },
  { day: 'Tue', visits: 31 },
  { day: 'Wed', visits: 28 },
  { day: 'Thu', visits: 36 },
  { day: 'Fri', visits: 41 }
]

export function AdminChartBuilder() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-indigo-700 flex items-center gap-2">
          <BarChart2 className="w-5 h-5" /> Chart Builder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="visits" stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}