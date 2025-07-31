import { Card, CardContent } from '@/components/ui/card'

const employers = [
  { name: 'Techfinity', features: { AI: true, Video: false, Chat: true } },
  { name: 'NovaHealth', features: { AI: true, Video: true, Chat: true } },
]

export function FeatureTogglePanel() {
  return (
    <Card className="glass-card mt-6">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Employer Feature Toggles</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-300">
                <th>Employer</th>
                <th>AI</th>
                <th>Video</th>
                <th>Chat</th>
              </tr>
            </thead>
            <tbody>
              {employers.map((e, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="py-2">{e.name}</td>
                  {Object.entries(e.features).map(([feat, val]) => (
                    <td key={feat}>
                      <input type="checkbox" checked={val} onChange={() => {}} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}