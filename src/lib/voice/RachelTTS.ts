let currentAudio: HTMLAudioElement | null = null

export const RachelTTS = {
  async say(text: string) {
    try {
      const res = await fetch('/api/tts/rachel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
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