import { useEffect, useState, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Bot, Mic, XCircle } from 'lucide-react'
import { RachelTTS } from '@/lib/voice/RachelTTS'
import { IntentParser } from '@/lib/ai/IntentParser'
import { useVoiceCapture } from '@/lib/voice/useVoiceCapture'
import { RachelAfterAction } from '@/lib/ai/RachelAfterAction'
import { AssistantShortcutHandler } from '@/lib/ai/AssistantShortcutHandler'

export default function VoiceInterfaceShell() {
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [listening, setListening] = useState(false)
  const debouncedTranscript = useDebounce(transcript, 600)
  const micRef = useRef<HTMLButtonElement>(null)

  const { startListening, stopListening, interimText, error } = useVoiceCapture({
    onFinalTranscript: (text) => {
      setTranscript(text)
      RachelAfterAction.cancel() // Cancel when user speaks
    },
    onInterrupt: () => {
      RachelTTS.stop()
      RachelAfterAction.cancel() // Cancel when interrupted
    }
  })

  useEffect(() => {
    if (debouncedTranscript && debouncedTranscript.length > 3) {
      RachelAfterAction.cancel() // Cancel any pending suggestions
      
      const processTranscript = async () => {
        const shortcutHandled = await AssistantShortcutHandler.handle(transcript)
        if (!shortcutHandled) {
          // fallback to IntentParser
          const intent = await IntentParser.handle(transcript)
          setResponse(intent.feedback)
          await RachelTTS.say(intent.feedback)
          intent?.action?.()
        }
        RachelAfterAction.init() // Schedule follow-up suggestion
      }
      
      processTranscript()
    }
  }, [debouncedTranscript])

  const handleFallback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transcript) return
    RachelAfterAction.cancel() // Cancel any pending suggestions
    
    const shortcutHandled = await AssistantShortcutHandler.handle(transcript)
    if (!shortcutHandled) {
      // fallback to IntentParser
      const intent = await IntentParser.handle(transcript)
      setResponse(intent.feedback)
      await RachelTTS.say(intent.feedback)
      intent?.action?.()
    }
    RachelAfterAction.init() // Schedule follow-up suggestion
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
      <form onSubmit={handleFallback} className="flex items-center gap-2 p-3 bg-white/80 rounded-xl shadow-lg">
        <input
          type="text"
          placeholder="Speak or type..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
        />
        <button
          type="button"
          ref={micRef}
          onClick={() => {
            if (listening) {
              stopListening()
              setListening(false)
            } else {
              startListening()
              setListening(true)
            }
          }}
          className={`rounded-full p-2 transition ${
            listening ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
          }`}
        >
          {listening ? <XCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </form>

      {response && (
        <div className="mt-2 bg-white/70 text-sm rounded-lg p-3 shadow border border-slate-100 animate-fade-in">
          <p className="text-slate-800 flex gap-2 items-center">
            <Bot className="w-4 h-4 text-indigo-500" /> {response}
          </p>
        </div>
      )}
    </div>
  )
}