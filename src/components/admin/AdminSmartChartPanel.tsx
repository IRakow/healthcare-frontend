import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Button } from '@/components/ui/button'
import { speak } from '@/lib/voice/RachelTTSQueue'

ChartJS.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
)

const weeklyData = [82, 99, 112, 95, 148, 132, 178]
const lastWeekData = [76, 91, 105, 89, 120, 124, 160]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const getChartData = (data: number[]) => ({
  labels: days,
  datasets: [
    {
      label: 'AI Usage',
      data,
      borderColor: 'rgba(14, 165, 233, 1)',
      backgroundColor: 'rgba(14, 165, 233, 0.3)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
    }
  ]
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (val: any) => `${val} calls`
      }
    }
  }
}

export default function AdminSmartChartPanel() {
  const [mode, setMode] = useState<'current' | 'last'>('current')

  useEffect(() => {
    speak('Here is your AI usage for this week. Peak was Sunday.')
  }, [])

  const handleCompare = () => {
    setMode('last')
    speak('Now comparing with last week. Sunday's usage was 160 calls.')
  }

  const handleReset = () => {
    setMode('current')
    speak('Restored this week's AI trend.')
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        AI Usage — {mode === 'current' ? 'This Week' : 'Last Week'}
      </h2>

      <Line data={getChartData(mode === 'current' ? weeklyData : lastWeekData)} options={chartOptions} />

      <div className="mt-6 flex gap-3 flex-wrap">
        <Button size="sm" variant="outline" onClick={handleCompare}>Compare to Last Week</Button>
        <Button size="sm" variant="secondary" onClick={handleReset}>Back to Current</Button>
        <Button size="sm" onClick={() => speak('Export started.')}>Export</Button>
      </div>
    </div>
  )
}