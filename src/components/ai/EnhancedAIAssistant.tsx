import { useState, useRef, useEffect } from 'react';
import { Mic, Send, StopCircle, Volume2, VolumeX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { VoiceSettings } from './VoiceSettings';
import { AIProviderSelector } from './AIProviderSelector';

export function EnhancedAIAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [selectedModel, setSelectedModel] = useState('eleven_monolingual_v1');
  const [autoSpeak, setAutoSpeak] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  // Handle voice input
  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Visualize audio level
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel((average / 255) * 100);
          requestAnimationFrame(updateLevel);
        }
      };

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setAudioLevel(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice input.');
    }
  };

  const stopVoiceInput = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Transcribe audio using Deepgram
  const transcribeAudio = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/deepgram-transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: audioBlob
      });

      const result = await response.json();
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      
      if (transcript) {
        setQuery(transcript);
        // Automatically submit after transcription
        handleSubmit(transcript);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit query to AI
  const handleSubmit = async (text?: string) => {
    const queryText = text || query;
    if (!queryText.trim()) return;
    
    setLoading(true);
    setResponse('');

    try {
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      
      const res = await fetch(`${supabaseUrl}/functions/v1/ai-voice`, {
        method: 'POST',
        body: JSON.stringify({ query: queryText }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let speechBuffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setResponse(fullResponse);
        
        // Buffer text for natural speech chunks
        speechBuffer += chunk;
        if (autoSpeak && (speechBuffer.match(/[.!?]/g) || speechBuffer.length > 100)) {
          speak(speechBuffer, { 
            voice: selectedVoice, 
            model: selectedModel,
            stream: true 
          });
          speechBuffer = '';
        }
      }

      // Speak any remaining text
      if (autoSpeak && speechBuffer) {
        speak(speechBuffer, { 
          voice: selectedVoice, 
          model: selectedModel 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, I encountered an error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border shadow-2xl w-[95%] sm:w-[800px] rounded-3xl p-6 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={autoSpeak ? '' : 'text-gray-400'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <VoiceSettings
            onVoiceChange={setSelectedVoice}
            onModelChange={setSelectedModel}
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Audio level indicator */}
        {isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600 animate-pulse">● Recording</span>
              <span className="text-gray-500">Speak clearly</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        )}

        {/* Input area */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Type or speak your question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={loading || isRecording}
            className="flex-1"
          />
          
          <Button
            onClick={() => handleSubmit()}
            disabled={loading || !query.trim() || isRecording}
          >
            <Send className="w-4 h-4" />
          </Button>
          
          <Button
            variant={isRecording ? 'destructive' : 'secondary'}
            onClick={isRecording ? stopVoiceInput : startVoiceInput}
            disabled={loading}
          >
            {isRecording ? (
              <StopCircle className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Response area */}
        {response && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <p className="text-gray-800 whitespace-pre-wrap flex-1">{response}</p>
              {isSpeaking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopSpeaking}
                  className="ml-2"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {loading && !response && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>Thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}