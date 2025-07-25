import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function VoiceDietaryInput() {
  const [transcript, setTranscript] = useState('')
  const [listening, setListening] = useState(false)
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition

  const startListening = () => {
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.lang = 'en-US'
    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript
      setTranscript(spokenText)
    }
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
    }
    recognition.start()
    setListening(true)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Voice Food Entry</h2>
      <Button onClick={startListening} disabled={listening}>
        {listening ? 'Listening…' : 'Start Speaking'}
      </Button>
      {transcript && (
        <p className="mt-4 bg-gray-50 border rounded p-3 text-sm">
          Transcript: <strong>{transcript}</strong>
        </p>
      )}
    </div>
  )
}