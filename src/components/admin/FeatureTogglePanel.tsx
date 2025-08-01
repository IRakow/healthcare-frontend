import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Settings2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const employers = [
  { name: 'NovaHealth', features: { AI: true, Video: false, Chat: true } },
  { name: 'ZenRx', features: { AI: true, Video: true, Chat: false } },
  { name: 'PurityCare', features: { AI: false, Video: true, Chat: true } }
]

export function FeatureTogglePanel() {
  const [data, setData] = useState(employers)

  const toggle = (index: number, key: keyof typeof employers[0]['features']) => {
    const updated = [...data]
    updated[index].features[key] = !updated[index].features[key]
    setData(updated)
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-fuchsia-700 flex items-center gap-2">
          <Settings2 className="w-5 h-5" /> Employer Feature Toggles
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-300">
              <th className="py-2">Employer</th>
              <th>AI</th>
              <th>Video</th>
              <th>Chat</th>
            </tr>
          </thead>
          <tbody>
            {data.map((e, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="py-2 font-medium text-slate-800">{e.name}</td>
                {(['AI', 'Video', 'Chat'] as const).map((feat) => (
                  <td key={feat}>
                    <Switch
                      checked={e.features[feat]}
                      onCheckedChange={() => toggle(i, feat)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}