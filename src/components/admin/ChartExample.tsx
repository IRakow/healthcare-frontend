import { useEffect, useRef } from 'react'
import { Chart } from 'chart.js'
import { Button } from '@/components/ui/button'
import '@/lib/chartConfig' // Import chart config to register plugins

export default function ChartExample() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [30000, 35000, 32000, 40000, 38000, 45000],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true // ✅ Now this works with Filler plugin registered
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false } // Hide native Chart.js legend
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Revenue Overview</h3>
        <div className="flex gap-2">
          <Button variant="secondary" className="text-sm px-3 py-2">
            Export to PDF
          </Button>
          <Button variant="outline" size="sm" className="ml-2">
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  )
}