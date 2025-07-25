import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

export default function VoiceAssistant({ role }: { role: string }) {
  const {
    transcript,
    response,
    isListening,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    queryText
  } = useVoiceAssistant();

  const handleRecording = async () => {
    if (isListening) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // Example of direct API call
  const directAPICall = async (query: string) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/ai-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: `${query} (Context: ${role})` }),
    });
    return response;
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-2">🎙️ Ask Anything</h2>
      <button 
        className={`px-4 py-2 rounded transition-colors ${
          isListening ? 'bg-red-600 text-white animate-pulse' : 
          isProcessing ? 'bg-gray-400 text-white cursor-not-allowed' : 
          'bg-blue-600 text-white hover:bg-blue-700'
        }`} 
        onClick={handleRecording}
        disabled={isProcessing}
      >
        {isListening ? 'Stop Recording' : isProcessing ? 'Processing...' : 'Start Voice Session'}
      </button>
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      {transcript && <p className="mt-2 text-sm text-gray-500">You said: {transcript}</p>}
      {response && (
        <div className="mt-2">
          <p className="text-green-700 font-medium">AI Response:</p>
          <p className="text-gray-800 mt-1">{response}</p>
        </div>
      )}
    </div>
  );
}