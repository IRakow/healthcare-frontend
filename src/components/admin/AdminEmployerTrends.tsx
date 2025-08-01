import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

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
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Employer Growth Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip wrapperClassName="!text-xs" />
            <Line
              type="monotone"
              dataKey="employers"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 1, fill: '#0f766e' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}