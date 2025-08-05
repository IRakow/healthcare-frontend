// src/lib/voice/useRachelMemoryStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AiMode = 'talk' | 'silent';

interface RachelMemoryState {
  rachelMemory: string;
  sessionStarted: boolean;
  aiMode: AiMode;
  setRachelMemory: (memory: string) => void;
  setSessionStarted: (started: boolean) => void;
  setAiMode: (mode: AiMode) => void;
  clearMemory: () => void;
  resetAll: () => void;
}

export const useRachelMemoryStore = create<RachelMemoryState>()(
  persist(
    (set) => ({
      rachelMemory: '',
      sessionStarted: false,
      aiMode: 'talk',

      setRachelMemory: (memory) => set({ rachelMemory: memory }),
      setSessionStarted: (started) => set({ sessionStarted: started }),
      setAiMode: (mode) => set({ aiMode: mode }),

      clearMemory: () => set({ rachelMemory: '' }),
      resetAll: () =>
        set({
          rachelMemory: '',
          sessionStarted: false,
          aiMode: 'talk',
        }),
    }),
    {
      name: 'rachel-memory-store', // localStorage key
    }
  )
);