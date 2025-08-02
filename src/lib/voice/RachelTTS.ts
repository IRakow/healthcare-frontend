let currentAudio: HTMLAudioElement | null = null

export const RachelTTS = {
  async say(text: string) {
    try {
      console.log('[RachelTTS] Speaking:', text)
      const res = await fetch('/api/rachel/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      
      if (!res.ok) {
        console.error('[RachelTTS] Response not OK:', res.status)
        const error = await res.text()
        console.error('[RachelTTS] Error:', error)
        return
      }
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      if (currentAudio) {
        currentAudio.pause()
        currentAudio = null
      }

      const audio = new Audio(url)
      currentAudio = audio
      await audio.play()
    } catch (err) {
      console.error('TTS error:', err)
    }
  },
  stop() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
  }
}