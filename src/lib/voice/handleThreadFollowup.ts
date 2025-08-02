import { useRachelMemoryStore } from './useRachelMemoryStore'
import { speak } from './RachelTTSQueue'

export async function handleThreadFollowup(text: string): Promise<boolean> {
  const { pendingThread, clearThread } = useRachelMemoryStore.getState()

  if (!pendingThread) return false

  const input = text.toLowerCase()

  if (pendingThread.intent === 'exportFormat') {
    if (input.includes('pdf')) {
      speak('Exporting PDF now.')
      // callPDFExport(pendingThread.payload)
      clearThread()
      return true
    }
    if (input.includes('csv')) {
      speak('CSV export in progress.')
      // callCSVExport(pendingThread.payload)
      clearThread()
      return true
    }
    speak("I didn't catch that. Would you like PDF or CSV?")
    return true
  }

  return false
}