import { useRachelMemoryStore } from './useRachelMemoryStore'
import { store } from './voiceMemoryStore'

let queue: string[] = []
let isSpeaking = false

export async function speak(text: string) {
  const interrupt = useRachelMemoryStore.getState().interrupt
  const setLast = useRachelMemoryStore.getState().setLast

  interrupt()       // 🛑 Cancel anything in progress
  queue.push(text)
  setLast(text)     // 🧠 Store in memory
  
  // Also store in voice memory store
  store.getState().setLastSpoken(text)
  
  processQueue()
}

async function processQueue() {
  if (isSpeaking || queue.length === 0) return

  isSpeaking = true
  const message = queue.shift()
  if (!message) return

  try {
    const voice = new SpeechSynthesisUtterance(message)
    voice.lang = 'en-US'
    voice.rate = 1.0
    voice.pitch = 1.1
    voice.voice = speechSynthesis
      .getVoices()
      .find(v => v.name.toLowerCase().includes('rachel')) || null

    await new Promise<void>((resolve) => {
      voice.onend = () => resolve()
      speechSynthesis.speak(voice)
    })
  } catch (err) {
    console.error('[RachelTTSQueue Error]', err)
  } finally {
    isSpeaking = false
    processQueue()
  }
}