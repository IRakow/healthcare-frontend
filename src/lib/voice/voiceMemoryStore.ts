import { create } from 'zustand'

interface VoiceMemoryState {
  lastSpoken: string
  setLastSpoken: (text: string) => void
}

export const store = create<VoiceMemoryState>((set) => ({
  lastSpoken: '',
  setLastSpoken: (text) => set({ lastSpoken: text })
}))