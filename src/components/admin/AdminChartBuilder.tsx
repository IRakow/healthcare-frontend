import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

const data = [
  { label: 'Mon', steps: 7200 },
  { label: 'Tue', steps: 8200 },
  { label: 'Wed', steps: 9100 },
  { label: 'Thu', steps: 7840 },
  { label: 'Fri', steps: 8500 }
]

export function AdminChartBuilder() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-indigo-700">📈 Chart Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="steps" stroke="#0ea5e9" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}