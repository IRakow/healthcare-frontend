import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Mic } from 'lucide-react'
import { useVoiceCapture } from '@/lib/voice/useVoiceCapture'

export function VoiceHUDOverlay() {
  const [active, setActive] = useState(false)
  const [interim, setInterim] = useState('')

  const { startListening, stopListening, interimText } = useVoiceCapture({
    onFinalTranscript: () => setInterim(''),
    onInterim: (text) => setInterim(text)
  })

  useEffect(() => {
    startListening()
    setActive(true)
    return () => stopListening()
  }, [])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="animate-pulse text-indigo-500">
            <Mic className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-800 italic">
            {interim || 'Listening...'}
          </p>
          <Sparkles className="w-4 h-4 text-indigo-300" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}