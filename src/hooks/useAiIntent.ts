import { useState } from 'react';
import { aiIntentService } from '@/services/aiIntentService';

export function useAiIntent() {
  const [processing, setProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');

  const processIntent = async (text: string) => {
    setProcessing(true);
    
    try {
      const lowerText = text.toLowerCase();
      let result;

      // Route to appropriate handler based on keywords
      if (lowerText.includes('book') || lowerText.includes('schedule') || lowerText.includes('appointment')) {
        result = await aiIntentService.handleAppointmentIntent(text);
      } else if (lowerText.includes('add medication') || lowerText.includes('taking')) {
        result = await aiIntentService.handleMedicationIntent(text);
      } else {
        result = await aiIntentService.handleQueryIntent(text);
      }

      setLastResponse(result.reply);
      return result;
    } catch (error) {
      const errorMessage = 'Sorry, I encountered an error processing your request.';
      setLastResponse(errorMessage);
      return {
        reply: errorMessage,
        success: false
      };
    } finally {
      setProcessing(false);
    }
  };

  const processCommand = async (command: string, parsed: any) => {
    setProcessing(true);
    
    try {
      const result = await aiIntentService.handleAiIntent(parsed, command);
      setLastResponse(result.reply);
      return result;
    } catch (error) {
      const errorMessage = 'Sorry, I encountered an error processing your command.';
      setLastResponse(errorMessage);
      return {
        reply: errorMessage,
        success: false
      };
    } finally {
      setProcessing(false);
    }
  };

  return {
    processIntent,
    processCommand,
    processing,
    lastResponse
  };
}

// Example usage in a component:
/*
function VoiceAssistant() {
  const { processIntent, processing, lastResponse } = useAiIntent();

  const handleVoiceInput = async (transcript: string) => {
    const result = await processIntent(transcript);
    
    if (result.success) {
      // Speak the response
      speechSynthesis.speak(new SpeechSynthesisUtterance(result.reply));
    }
  };

  return (
    <div>
      <button onClick={() => handleVoiceInput("Book appointment with Dr. Smith tomorrow at 2pm")}>
        Test Voice Command
      </button>
      {processing && <p>Processing...</p>}
      {lastResponse && <p>{lastResponse}</p>}
    </div>
  );
}
*/