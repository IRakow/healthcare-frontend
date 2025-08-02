import { useEffect, useState } from 'react'

interface UseVoiceCaptureOptions {
  onFinalTranscript?: (text: string) => void
  onInterim?: (text: string) => void
  onInterrupt?: () => void
}

export function useVoiceCapture({ onFinalTranscript, onInterim, onInterrupt }: UseVoiceCaptureOptions) {
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  let controller: AbortController | null = null

  const startListening = async () => {
    if (listening) return
    setListening(true)
    controller = new AbortController()

    const response = await fetch('/api/deepgram/stream', {
      method: 'POST',
      signal: controller.signal
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) return setError('No stream reader')

    const streamLoop = async () => {
      try {
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          const payload = JSON.parse(chunk)

          if (payload.is_final) {
            setInterimText('')
            onFinalTranscript?.(payload.transcript)
          } else if (payload.interruption) {
            onInterrupt?.()
          } else if (payload.transcript) {
            setInterimText(payload.transcript)
            onInterim?.(payload.transcript)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      }
    }
    streamLoop()
  }

  const stopListening = () => {
    controller?.abort()
    setListening(false)
  }

  return { startListening, stopListening, interimText, error }
}