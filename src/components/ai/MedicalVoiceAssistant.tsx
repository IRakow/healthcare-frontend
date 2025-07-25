import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Activity, Brain, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { supabase } from '@/lib/supabase';

interface MedicalContext {
  patientId?: string;
  symptoms?: string[];
  medications?: string[];
  allergies?: string[];
}

interface MedicalVoiceAssistantProps {
  context?: MedicalContext;
  onTranscriptSave?: (transcript: string) => void;
}

export function MedicalVoiceAssistant({ context, onTranscriptSave }: MedicalVoiceAssistantProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini'>('openai');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const { 
    start: startListening, 
    stop: stopListening, 
    isListening, 
    transcript: liveTranscript,
    interimTranscript 
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (result) => {
      if (result.isFinal) {
        handleUserInput(result.transcript);
      }
    }
  });

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();

  // Build medical context prompt
  const buildContextPrompt = (userInput: string) => {
    let prompt = `You are a medical AI assistant. Please provide helpful, accurate medical information while reminding users to consult healthcare professionals for personalized advice.\n\n`;
    
    if (context) {
      if (context.patientId) {
        prompt += `Patient ID: ${context.patientId}\n`;
      }
      if (context.symptoms?.length) {
        prompt += `Current symptoms: ${context.symptoms.join(', ')}\n`;
      }
      if (context.medications?.length) {
        prompt += `Current medications: ${context.medications.join(', ')}\n`;
      }
      if (context.allergies?.length) {
        prompt += `Known allergies: ${context.allergies.join(', ')}\n`;
      }
      prompt += '\n';
    }
    
    prompt += `User query: ${userInput}`;
    return prompt;
  };

  const handleUserInput = async (input: string) => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      const functionName = selectedProvider === 'openai' ? 'ai-voice' : 'gemini-chat';
      const contextualPrompt = buildContextPrompt(input);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ query: contextualPrompt })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let speechBuffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        
        // Update message in real-time
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.role === 'assistant') {
            newMessages[newMessages.length - 1].content = fullResponse;
          } else {
            newMessages.push({ role: 'assistant', content: fullResponse });
          }
          return newMessages;
        });
        
        // Buffer for natural speech
        speechBuffer += chunk;
        if (speechBuffer.match(/[.!?]/) || speechBuffer.length > 100) {
          speak(speechBuffer, { 
            voice: 'rachel',
            model: 'eleven_monolingual_v1',
            stream: true 
          });
          speechBuffer = '';
        }
      }

      // Speak remaining text
      if (speechBuffer) {
        speak(speechBuffer, { voice: 'rachel' });
      }

      // Save transcript if callback provided
      if (onTranscriptSave) {
        const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        onTranscriptSave(transcript);
      }

    } catch (error) {
      console.error('Error processing request:', error);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'I apologize, but I encountered an error processing your request. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Visual audio level indicator
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Medical Voice Assistant
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant={selectedProvider === 'openai' ? 'default' : 'secondary'}>
              {selectedProvider === 'openai' ? (
                <>
                  <Brain className="w-3 h-3 mr-1" />
                  GPT-4
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini
                </>
              )}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProvider(p => p === 'openai' ? 'gemini' : 'openai')}
            >
              Switch AI
            </Button>
          </div>
        </div>

        {/* Medical Context Display */}
        {context && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-sm">
                {context.patientId && <div>Patient: {context.patientId}</div>}
                {context.symptoms?.length > 0 && (
                  <div>Symptoms: {context.symptoms.join(', ')}</div>
                )}
                {context.medications?.length > 0 && (
                  <div>Medications: {context.medications.join(', ')}</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-50 ml-12' 
                  : 'bg-gray-50 mr-12'
              }`}
            >
              <div className="font-medium text-sm text-gray-500 mb-1">
                {message.role === 'user' ? 'You' : 'Medical AI'}
              </div>
              <div className="text-gray-800">{message.content}</div>
            </div>
          ))}
          
          {isProcessing && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="bg-gray-50 p-3 rounded-lg mr-12">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span className="text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Transcript */}
        {(liveTranscript || interimTranscript) && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium mb-1">Transcribing...</div>
            <div className="text-gray-700">
              {liveTranscript}
              <span className="text-gray-400">{interimTranscript}</span>
            </div>
          </div>
        )}

        {/* Audio Level */}
        {isListening && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600 animate-pulse flex items-center gap-1">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                Listening
              </span>
              <span className="text-gray-500">Speak clearly</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant={isListening ? 'destructive' : 'default'}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className="min-w-[200px]"
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          {isSpeaking && (
            <Button
              size="lg"
              variant="outline"
              onClick={stopSpeaking}
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Stop Speaking
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center mt-4">
          This AI assistant provides general medical information only. 
          Always consult with qualified healthcare professionals for medical advice.
        </div>
      </div>
    </Card>
  );
}