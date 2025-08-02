import AdminLayout from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Brain, FileText, Server, AlertTriangle, Download, RefreshCw, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { useState } from 'react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
  const [aiData] = useState<number[]>([10, 22, 18, 32, 45, 51, 60])
  const navigate = useNavigate()

  const metricCard = (title: string, value: string, icon: JSX.Element, color: string, onClick?: () => void) => (
    <Card
      className={`rounded-2xl p-5 shadow-xl backdrop-blur-xl bg-white/80 border border-white/30 cursor-pointer hover:scale-[1.02] transition-all ${color}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )

  const aiChartData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'AI Activity',
        data: aiData,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79,70,229,0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: { y: { beginAtZero: true } }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800">Admin Command Hub</h1>
          <p className="text-sm text-muted-foreground">Live stats, alerts, and insights across your platform.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
          <Button size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {metricCard('Total Users', '1,208', <Users className="w-6 h-6 text-blue-600" />, '', () => navigate('/admin/users'))}
        {metricCard('AI Calls (24h)', '534', <Brain className="w-6 h-6 text-purple-600" />, '', () => navigate('/admin/ai'))}
        {metricCard('Unpaid Invoices', '7', <FileText className="w-6 h-6 text-orange-600" />, '', () => navigate('/admin/invoices'))}
        {metricCard('Errors Today', '3', <AlertTriangle className="w-6 h-6 text-red-500" />, '', () => navigate('/admin/audit-log'))}
        {metricCard('System Uptime', '99.97%', <Server className="w-6 h-6 text-green-600" />, '')}
        {metricCard('Open Broadcasts', '2', <Mail className="w-6 h-6 text-yellow-500" />, '', () => navigate('/admin/broadcast'))}
      </div>

      <Card className="mt-10 p-6 rounded-2xl shadow-lg h-[320px]">
        <p className="text-lg font-semibold text-slate-800 mb-4">7-Day AI Call Trend</p>
        <div className="relative w-full h-full">
          <Line data={aiChartData} options={chartOptions} />
        </div>
      </Card>
    </AdminLayout>
  )
}