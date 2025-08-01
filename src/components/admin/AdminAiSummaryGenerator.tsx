// Module 11: AdminAiSummaryGenerator.tsx
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function AdminAiSummaryGenerator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const handleGenerate = async () => {
    const res = await fetch('/api/ai/gemini', {
      method: 'POST',
      body: JSON.stringify({ prompt: input }),
      headers: { 'Content-Type': 'application/json' }
    })
    const json = await res.json()
    setOutput(json.summary || 'No response')
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-indigo-700 flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> AI Summary Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste text, lab notes, visit summary..."
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button className="w-full" onClick={handleGenerate} disabled={!input.trim()}>
          ✨ Generate Summary
        </Button>
        {output && (
          <div className="p-4 rounded-lg bg-white/70 text-sm text-slate-800 border">
            {output}
          </div>
        )}
      </CardContent>
    </Card>
  )
}