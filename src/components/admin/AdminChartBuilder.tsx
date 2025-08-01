import { Card, CardContent } from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { useState } from 'react'

const chartData = [
  { label: 'Week 1', ai: 134, users: 42 },
  { label: 'Week 2', ai: 185, users: 47 },
  { label: 'Week 3', ai: 210, users: 50 },
  { label: 'Week 4', ai: 192, users: 53 }
]

export function AdminChartBuilder() {
  const [type, setType] = useState<'line' | 'area'>('area')

  return (
    <Card className="glass-card">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">📉 Chart Builder</h2>
        <div className="mb-4">
          <select
            value={type}
            onChange={e => setType(e.target.value as 'line' | 'area')}
            className="bg-white/50 backdrop-blur border rounded-xl px-4 py-2"
          >
            <option value="area">AI Activity (Area)</option>
            <option value="line">User Growth (Line)</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="ai" stroke="#0ea5e9" fill="url(#colorAI)" />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#14b8a6" strokeWidth={3} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}