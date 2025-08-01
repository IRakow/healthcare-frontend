import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { getEmployerSettings, updateVoice } from '@/lib/employerSettingsService'

const employers = [
  { id: 'e1', name: 'Techfinity' },
  { id: 'e2', name: 'NovaHealth' }
]
const voices = ['Rachel', 'Bella', 'Adam']

export function VoiceBrandingSelector() {
  const [selectedVoices, setSelectedVoices] = useState<{ [id: string]: string }>({})

  useEffect(() => {
    Promise.all(employers.map(e => getEmployerSettings(e.id))).then(results => {
      const voiceMap: any = {}
      results.forEach((s, i) => (voiceMap[employers[i].id] = s?.default_voice || 'Rachel'))
      setSelectedVoices(voiceMap)
    })
  }, [])

  const handleChange = (empId: string, voice: string) => {
    setSelectedVoices(prev => ({ ...prev, [empId]: voice }))
    updateVoice(empId, voice)
  }

  return (
    <Card className="glass-card">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">🎙 Voice Branding</h2>
        {employers.map((e, i) => (
          <div key={i} className="flex justify-between items-center mb-3">
            <span className="font-medium">{e.name}</span>
            <select
              value={selectedVoices[e.id]}
              onChange={e => handleChange(employers[i].id, e.target.value)}
              className="bg-white/40 backdrop-blur px-3 py-1 rounded-lg border"
            >
              {voices.map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}