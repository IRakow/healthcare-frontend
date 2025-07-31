import { Card, CardContent } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'

const COLORS = ['#0ea5e9', '#14b8a6']
const data = [
  { name: 'Gemini', value: 62 },
  { name: 'OpenAI', value: 38 },
]

export function AiUsageChart() {
  return (
    <Card className="glass-card mt-6">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">AI Model Usage</h2>
        <PieChart width={280} height={220}>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </CardContent>
    </Card>
  )
}