import { speak } from './RachelTTSQueue'
import { useRachelMemoryStore } from './useRachelMemoryStore'

export function handleRepeatCommand(text: string): boolean {
  if (text.toLowerCase().includes('repeat that')) {
    const phrase = useRachelMemoryStore.getState().lastSpoken
    if (phrase) {
      speak(phrase)
    } else {
      speak('There is nothing to repeat.')
    }
    return true
  }

  return false
}