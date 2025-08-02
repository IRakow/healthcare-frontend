import { useVoiceCapture } from './useVoiceCapture'

export function useAdminVoiceCapture() {
  const { startListening, stopListening, interimText, error } = useVoiceCapture({
    onFinalTranscript: () => {
      // Admin voice capture processes transcripts through handleAdminCommand
    }
  })

  return { startListening, stopListening, interimText, error }
}