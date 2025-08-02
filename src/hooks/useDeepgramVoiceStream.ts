import { useEffect, useRef } from 'react'

export function useDeepgramVoiceStream() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    startStreaming()
    return () => stopStreaming()
  }, [])

  async function startStreaming() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)

    const socket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?punctuate=true`,
      ['token', process.env.NEXT_PUBLIC_DEEPGRAM_KEY!]
    )

    socket.onopen = () => {
      mediaRecorder.start(250)
      mediaRecorder.ondataavailable = (event) => {
        if (socket.readyState === 1) {
          socket.send(event.data)
        }
      }
    }

    socket.onmessage = async (message) => {
      const data = JSON.parse(message.data)
      const transcript = data.channel?.alternatives?.[0]?.transcript
      if (transcript) {
        const aiResponse = await fetch('/api/ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: transcript })
        }).then(res => res.json())

        if (aiResponse?.output) {
          const tts = await fetch('/api/rachel/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: aiResponse.output })
          })

          const blob = await tts.blob()
          const audio = new Audio(URL.createObjectURL(blob))
          audio.play()
        }
      }
    }

    mediaRecorderRef.current = mediaRecorder
    socketRef.current = socket
  }

  function stopStreaming() {
    mediaRecorderRef.current?.stop()
    socketRef.current?.close()
  }

  return { startStreaming, stopStreaming }
}