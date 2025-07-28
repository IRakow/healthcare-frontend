import { streamToAI as streamVoice } from '@/lib/api/streamToAI';

/**
 * Transcribes audio to text using AI
 * This is a wrapper around the API function for backward compatibility
 * @deprecated Use @/lib/api/streamToAI instead
 */
export async function streamToAI(audioStream: Blob, callback: (text: string) => void) {
  try {
    await streamVoice(audioStream, callback);
  } catch (error) {
    console.error('Failed to transcribe audio:', error);
    callback('Error: Failed to transcribe audio');
  }
}