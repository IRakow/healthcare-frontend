import { useState, useRef } from 'react'

interface UseVoiceCaptureOptions {
  onFinalTranscript?: (text: string) => void
  onInterim?: (text: string) => void
  onInterrupt?: () => void
}

export function useVoiceCapture({ onFinalTranscript, onInterim }: UseVoiceCaptureOptions) {
  const [listening, setListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const connectionIdRef = useRef<string | null>(null)

  const startListening = async () => {
    if (listening) return
    setListening(true)
    setError(null)
    
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000
        } 
      })
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      // Set up EventSource for receiving transcripts
      const eventSource = new EventSource('/api/deepgram/stream')
      
      // Wait for connection ID
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.connectionId) {
            connectionIdRef.current = data.connectionId
            console.log('[Voice Capture] Connected with ID:', data.connectionId)
          } else if (data.error) {
            setError(data.error)
            return
          } else if (data.transcript !== undefined) {
            if (data.is_final) {
              setInterimText('')
              onFinalTranscript?.(data.transcript)
            } else if (data.transcript) {
              setInterimText(data.transcript)
              onInterim?.(data.transcript)
            }
          }
        } catch (err) {
          console.error('[Voice Capture] Parse error:', err)
        }
      }
      
      eventSource.onerror = (err) => {
        console.error('[Voice Capture] EventSource error:', err)
        setError('Connection to speech recognition failed')
        stopListening()
      }
      
      // Send audio chunks to server
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && connectionIdRef.current) {
          try {
            await fetch('/api/deepgram/stream', {
              method: 'POST',
              body: event.data,
              headers: {
                'Content-Type': 'audio/webm',
                'X-Connection-ID': connectionIdRef.current
              }
            })
          } catch (err) {
            console.error('[Voice Capture] Send error:', err)
          }
        }
      }
      
      // Start recording
      mediaRecorder.start(250) // Send chunks every 250ms
      
      // Store references for cleanup
      mediaRecorderRef.current = mediaRecorder
      streamRef.current = stream
      eventSourceRef.current = eventSource
      
    } catch (err: any) {
      setError(err.message || 'Failed to access microphone')
      setListening(false)
    }
  }

  const stopListening = () => {
    // Stop the media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Close the EventSource connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    // Clear connection ID
    connectionIdRef.current = null
    
    setListening(false)
    setInterimText('')
  }

  return { startListening, stopListening, interimText, error }
}