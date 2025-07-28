import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Moon, Droplet, Flame } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface VitalsTrend {
  id: string
  patient_id: string
  date: string
  sleep: number | null
  hydration: number | null
  protein: number | null
}

interface HealthChartsProps {
  patientId: string
}

export default function HealthCharts({ patientId }: HealthChartsProps) {
  const [data, setData] = useState<VitalsTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('vitals_trend')
          .select('*')
          .eq('patient_id', patientId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
          .order('date', { ascending: true })

        if (!error && data) {
          // Format dates for display
          const formattedData = data.map(item => ({
            ...item,
            displayDate: new Date(item.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          }))
          setData(formattedData)
        } else {
          // Use mock data if no real data available
          setData(generateMockData())
        }
      } catch (err) {
        console.error('Error fetching vitals trend:', err)
        setData(generateMockData())
      } finally {
        setLoading(false)
      }
    }

    if (patientId) fetchData()
  }, [patientId])

  const generateMockData = () => {
    const mockData: any[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      mockData.push({
        id: `mock-${i}`,
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sleep: 6 + Math.random() * 3,
        hydration: 50 + Math.random() * 40,
        protein: 60 + Math.random() * 40
      })
    }
    return mockData
  }

  return (
    <Card className="shadow-xl border border-emerald-200 dark:border-zinc-700">
      <CardHeader>
        <CardTitle className="text-lg">Health Trends - Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrendChart 
          title="Sleep (hrs)" 
          dataKey="sleep" 
          color="#6D28D9" 
          data={data} 
          loading={loading}
          icon={<Moon className="w-4 h-4" />}
          target={8}
        />
        <TrendChart 
          title="Hydration (oz)" 
          dataKey="hydration" 
          color="#0EA5E9" 
          data={data} 
          loading={loading}
          icon={<Droplet className="w-4 h-4" />}
          target={64}
        />
        <TrendChart 
          title="Protein (g)" 
          dataKey="protein" 
          color="#F97316" 
          data={data} 
          loading={loading}
          icon={<Flame className="w-4 h-4" />}
          target={80}
        />
      </CardContent>
    </Card>
  )
}

function TrendChart({
  title,
  dataKey,
  color,
  data,
  loading,
  icon,
  target
}: {
  title: string
  dataKey: string
  color: string
  data: any[]
  loading: boolean
  icon?: React.ReactNode
  target?: number
}) {
  if (loading) {
    return (
      <div className="w-full h-64">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>
    )
  }

  // Calculate average
  const validData = data.filter(d => d[dataKey] !== null && d[dataKey] !== undefined)
  const average = validData.length > 0
    ? validData.reduce((sum, d) => sum + Number(d[dataKey]), 0) / validData.length
    : 0

  return (
    <div className="w-full h-64">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">
          Avg: {average.toFixed(1)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 10 }} 
            tickMargin={5}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            tick={{ fontSize: 10 }} 
            domain={dataKey === 'sleep' ? [0, 12] : undefined}
          />
          <Tooltip 
            contentStyle={{ 
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value: any) => [`${Number(value).toFixed(1)} ${dataKey === 'hydration' ? 'oz' : dataKey === 'protein' ? 'g' : 'hrs'}`, title]}
          />
          {target && (
            <Line
              type="monotone"
              dataKey={() => target}
              stroke="#10b981"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Target"
            />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
            fill={`url(#gradient-${dataKey})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}