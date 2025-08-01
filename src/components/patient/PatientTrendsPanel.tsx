// src/components/patient/PatientTrendsPanel.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { LineChart as LineChartIcon } from 'lucide-react'

const data = [
  { date: 'Jul 26', sleep: 6.5, hydration: 60, steps: 7400, protein: 54 },
  { date: 'Jul 27', sleep: 7.1, hydration: 68, steps: 8030, protein: 62 },
  { date: 'Jul 28', sleep: 6.8, hydration: 64, steps: 8212, protein: 59 },
  { date: 'Jul 29', sleep: 7.3, hydration: 72, steps: 8740, protein: 65 },
  { date: 'Jul 30', sleep: 7.0, hydration: 70, steps: 9100, protein: 67 }
]

export function PatientTrendsPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <LineChartIcon className="w-5 h-5" />
          Health Trends (5 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sleep" stroke="#0ea5e9" name="Sleep (hrs)" />
            <Line type="monotone" dataKey="hydration" stroke="#38bdf8" name="Hydration (oz)" />
            <Line type="monotone" dataKey="steps" stroke="#4ade80" name="Steps" />
            <Line type="monotone" dataKey="protein" stroke="#a855f7" name="Protein (g)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}