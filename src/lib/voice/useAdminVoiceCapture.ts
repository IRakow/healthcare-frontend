import { useVoiceCapture } from './useVoiceCapture'
import { handleAdminCommand } from './handleAdminCommand'

export function useAdminVoiceCapture(context?: string) {
  const { startListening, stopListening, interimText, error } = useVoiceCapture({
    onFinalTranscript: (transcript: string) => {
      // Process the voice command through Rachel
      console.log('Voice transcript received:', transcript)
      handleAdminCommand(transcript, context)
    }
  })

  return { startListening, stopListening, interimText, error }
}