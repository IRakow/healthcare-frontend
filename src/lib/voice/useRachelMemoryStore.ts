import { create } from 'zustand'

interface RachelState {
  lastSpoken: string
  pendingThread?: {
    intent: string
    payload?: any
  }
  interrupt(): void
  setLast(text: string): void
  setThread(intent: string, payload?: any): void
  clearThread(): void
}

export const useRachelMemoryStore = create<RachelState>((set) => ({
  lastSpoken: '',
  pendingThread: undefined,

  interrupt: () => {
    window.speechSynthesis.cancel()
  },

  setLast: (text) => set({ lastSpoken: text }),

  setThread: (intent, payload) =>
    set({ pendingThread: { intent, payload } }),

  clearThread: () => set({ pendingThread: undefined }),
}))