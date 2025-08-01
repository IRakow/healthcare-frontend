import { Card, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Mar', employers: 22 },
  { month: 'Apr', employers: 28 },
  { month: 'May', employers: 34 },
  { month: 'Jun', employers: 41 },
  { month: 'Jul', employers: 47 }
]

export function AdminEmployerTrends() {
  return (
    <Card className="glass-card">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">📈 Employer Growth</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="employers" stroke="#14b8a6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}