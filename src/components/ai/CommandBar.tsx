// File: src/components/ai/CommandBar.tsx
import { useRef, useState } from 'react'
import { useAICommand } from '@/hooks/useAICommand'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mic, Send } from 'lucide-react'

export function CommandBar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const { runCommand } = useAICommand()
  const { transcript, listening, startListening, stopListening, resetTranscript } = useSpeechRecognition()
  const { speak } = useTextToSpeech()

  const handleSubmit = async (value: string) => {
    if (!value) return
    setLoading(true)
    const output = await runCommand(value)
    if (output?.response) speak(output.response)
    setText('')
    setLoading(false)
  }

  const handleMic = () => {
    if (!listening) startListening()
    else {
      stopListening()
      if (transcript) handleSubmit(transcript)
      resetTranscript()
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4 z-50">
      <div className="flex items-center bg-background/80 backdrop-blur border border-white/10 rounded-full shadow-lg p-2">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(text)
          }}
          placeholder="Ask me anything..."
          className="bg-transparent border-none focus-visible:ring-0 text-white px-4"
        />
        <Button onClick={() => handleSubmit(text)} size="icon" variant="ghost" disabled={loading}>
          <Send className="h-5 w-5 text-white" />
        </Button>
        <Button onClick={handleMic} size="icon" variant="ghost">
          <Mic className={`h-5 w-5 ${listening ? 'text-emerald-500 animate-pulse' : 'text-white'}`} />
        </Button>
      </div>
    </div>
  )
}