import AdminAssistantBar from '@/components/AdminAssistantBar'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import VoiceHUDOverlay from '@/components/voice/VoiceHUDOverlay'
import { useEffect, useState } from 'react'
import { speak } from '@/lib/voice/RachelTTSQueue'
import { Line } from 'react-chartjs-2'
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
import { handleAdminCommand } from '@/lib/voice/handleAdminCommandEnhanced'

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

const employers = {
  Brightwell: [30, 40, 55, 60, 68, 77, 84],
  NovaCare: [45, 52, 61, 64, 69, 73, 80],
  SkyWellness: [22, 34, 44, 51, 59, 63, 71]
}

const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AdminEmployerTrendsPage() {
  const { startListening, interimText } = useAdminVoiceCapture()
  const [selected, setSelected] = useState(['Brightwell', 'NovaCare'])

  useEffect(() => {
    startListening()
    speak('Now showing employer usage trends.')
  }, [])

  const toggleEmployer = (name: string) => {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
    speak(`${name} ${selected.includes(name) ? 'hidden' : 'added'} to chart.`)
  }

  const datasets = selected.map((employer, idx) => ({
    label: employer,
    data: employers[employer as keyof typeof employers],
    borderColor: [`#60a5fa`, `#34d399`, `#f472b6`][idx % 3],
    backgroundColor: [`#bfdbfe`, `#6ee7b7`, `#f9a8d4`][idx % 3],
    fill: true,
    tension: 0.4,
    pointRadius: 2
  }))

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Employer Usage Trends</h1>

        <div className="mb-4 flex flex-wrap gap-3">
          {Object.keys(employers).map((name) => (
            <button
              key={name}
              onClick={() => toggleEmployer(name)}
              className={`text-sm px-3 py-1 rounded-md border transition-all ${
                selected.includes(name)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <Line
            data={{ labels, datasets }}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
          />
        </div>

        <div className="mt-8">
          <AdminAssistantBar onAsk={(text) => handleAdminCommand(text, 'charts')} />
        </div>

        <VoiceHUDOverlay interim={interimText} />
      </div>
    </div>
  )
}