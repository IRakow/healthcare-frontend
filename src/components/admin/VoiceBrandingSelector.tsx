import { Card, CardContent } from '@/components/ui/card'

const employers = ['Techfinity', 'NovaHealth', 'Atlas Inc']
const voices = ['Rachel', 'Bella', 'Adam']

export function VoiceBrandingSelector() {
  return (
    <Card className="glass-card mt-6">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Employer Voice Branding</h2>
        <ul className="space-y-3">
          {employers.map((e, i) => (
            <li key={i} className="flex items-center justify-between">
              <span className="font-semibold">{e}</span>
              <select className="bg-white/50 backdrop-blur px-3 py-2 rounded-xl border">
                {voices.map(v => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}