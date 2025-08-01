import { useState } from 'react'
import { runAI } from '@/lib/aiRouter'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export function PatientAIChatRouter() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [type, setType] = useState<'medical' | 'general'>('medical')

  const handleSubmit = async () => {
    setOutput('Thinking...')
    const result = await runAI({ prompt, model: type === 'medical' ? 'gemini' : 'openai' })
    setOutput(result)
  }

  return (
    <div className="max-w-xl mx-auto glass-card space-y-4 p-6">
      <h2 className="text-lg font-bold text-sky-800 flex items-center gap-2">
        <Bot className="w-5 h-5" /> Ask the Assistant
      </h2>

      <select
        value={type}
        onChange={e => setType(e.target.value as 'medical' | 'general')}
        className="w-full text-sm border rounded-lg bg-white/60 backdrop-blur px-3 py-2"
      >
        <option value="medical">Medical Chat (Gemini)</option>
        <option value="general">General Help (OpenAI)</option>
      </select>

      <Textarea
        placeholder="Ask your question..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      <Button className="w-full" onClick={handleSubmit}>Ask AI</Button>

      <div className="text-sm text-gray-700 whitespace-pre-wrap border-t pt-4">
        {output && (
          <>
            <strong className="block mb-2 text-gray-500">AI Response</strong>
            {output}
            {type === 'medical' && (
              <p className="mt-4 text-xs text-red-500 font-medium">
                ⚠️ This is not medical advice. Please consult your doctor.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}