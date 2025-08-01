import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Bot } from 'lucide-react'

const summary = `
Your hydration was below target on 3 of 5 days. 
You consistently met protein goals. 
Sleep average was 6.9 hours — aim for 7.5+ hrs. 
No new health flags.
`

export function AISummaryPanel() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sky-800">
          <Bot className="w-5 h-5" />
          Weekly AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{summary}</pre>
      </CardContent>
    </Card>
  )
}