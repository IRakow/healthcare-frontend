import { Card, CardContent } from '@/components/ui/card'

export function AiLogSearchPanel() {
  return (
    <Card className="glass-card mt-6">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">AI Log Filters</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select className="bg-white/50 backdrop-blur px-3 py-2 rounded-xl border">
            <option>All Models</option>
            <option>Gemini</option>
            <option>OpenAI</option>
          </select>

          <select className="bg-white/50 backdrop-blur px-3 py-2 rounded-xl border">
            <option>Status</option>
            <option>Success</option>
            <option>Fail</option>
          </select>

          <select className="bg-white/50 backdrop-blur px-3 py-2 rounded-xl border">
            <option>All Voices</option>
            <option>Rachel</option>
            <option>Bella</option>
            <option>Adam</option>
          </select>

          <input
            type="date"
            className="bg-white/50 backdrop-blur px-3 py-2 rounded-xl border"
            placeholder="Date"
          />
        </div>
      </CardContent>
    </Card>
  )
}