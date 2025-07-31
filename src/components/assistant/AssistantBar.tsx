// File: src/components/assistant/AssistantBar.tsx

import { useEffect, useRef, useState } from 'react';
import { Mic, Loader2, Bot, XCircle } from 'lucide-react';
import { useBrandingContext } from '@/contexts/BrandingProvider';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useAIStreaming } from '@/hooks/useAIStreaming';
import { useVoiceOutput } from '@/hooks/useVoiceOutput';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface AssistantBarProps {
  role: 'admin' | 'patient' | 'provider';
}

export default function AssistantBar({ role }: AssistantBarProps) {
  const { branding } = useBrandingContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { recording, transcript, startRecording, stopRecording, resetTranscript } = useVoiceInput();
  const { output, startStreaming, cancelStreaming } = useAIStreaming({ role });
  const { speak } = useVoiceOutput({ voiceId: branding.voice_profile_id });

  // Handle streamed output
  useEffect(() => {
    if (output && !streaming) {
      speak(output);
    }
  }, [output]);

  // Auto-trigger AI on voice transcript
  useEffect(() => {
    if (transcript && !recording) {
      handleSubmit(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (query: string) => {
    if (!query) return;
    setStreaming(true);
    setInput('');
    setError(null);
    try {
      await startStreaming(query);
    } catch (e: any) {
      console.error('AI error:', e);
      setError('Something went wrong. Try again.');
    } finally {
      setStreaming(false);
      resetTranscript();
    }
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 12 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50"
    >
      <div className="flex items-center bg-white/70 backdrop-blur border border-gray-300 rounded-full shadow-lg px-4 py-2">
        <Bot className="w-5 h-5 text-gray-600 mr-2" />
        <input
          type="text"
          ref={inputRef}
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
          placeholder={streaming ? 'Thinking...' : 'Ask me anything...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(input);
          }}
          disabled={streaming}
        />

        {streaming ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : recording ? (
          <XCircle
            className="w-5 h-5 text-red-500 cursor-pointer hover:opacity-80"
            onClick={stopRecording}
          />
        ) : (
          <Mic
            className={clsx('w-5 h-5 cursor-pointer text-emerald-600 hover:opacity-90', {
              'animate-pulse': recording
            })}
            onClick={startRecording}
          />
        )}
      </div>

      {error && (
        <p className="text-center text-sm text-red-500 mt-2 animate-fade-in">
          {error}
        </p>
      )}
    </motion.div>
  );
}