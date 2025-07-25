import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSearch } from '@/utils/searchHandler';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CommandBar({ role }: { role: string }) {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!input.trim()) return;
    const result = handleSearch(input, role, navigate);
    setReply(result);
    // Clear input after successful navigation
    if (result.includes('Navigating')) {
      setTimeout(() => {
        setInput('');
        setReply('');
      }, 2000);
    }
  }

  async function handleVoice() {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const buffer = await blob.arrayBuffer();

        try {
          const res = await fetch('/functions/v1/deepgram-transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'audio/webm' },
            body: buffer
          });

          const json = await res.json();
          const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript;
          
          if (transcript) {
            setInput(transcript);
            const result = handleSearch(transcript, role, navigate);
            setReply(result);
            
            // Clear after successful navigation
            if (result.includes('Navigating')) {
              setTimeout(() => {
                setInput('');
                setReply('');
              }, 2000);
            }
          }
        } catch (error) {
          console.error('Transcription error:', error);
          setReply('❌ Failed to transcribe audio');
        } finally {
          setIsRecording(false);
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };

      recorder.start();
      // Stop recording after 5 seconds
      setTimeout(() => {
        recorder.stop();
        setIsRecording(false);
      }, 5000);
    } catch (error) {
      console.error('Microphone error:', error);
      setReply('❌ Could not access microphone');
      setIsRecording(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[600px] bg-white/90 backdrop-blur-sm border shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 z-50">
      <input
        type="text"
        value={input}
        placeholder="Ask to go somewhere…"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isRecording}
      />
      <Button onClick={handleSubmit} disabled={!input.trim() || isRecording}>
        Go
      </Button>
      <Button 
        variant="secondary" 
        onClick={handleVoice}
        disabled={isRecording}
        className={isRecording ? 'animate-pulse bg-red-100' : ''}
      >
        <Mic className="w-4 h-4" />
      </Button>
      {reply && (
        <p className={`text-sm ml-2 ${reply.includes('❓') || reply.includes('❌') ? 'text-red-500' : 'text-gray-500'}`}>
          {reply}
        </p>
      )}
    </div>
  );
}

// Example usage in a layout component:
/*
import { CommandBar } from '@/components/CommandBar';
import { useAuth } from '@/hooks/useAuth';

function Layout({ children }) {
  const { user } = useAuth();
  const userRole = user?.role || 'patient';
  
  return (
    <div>
      {children}
      <CommandBar role={userRole} />
    </div>
  );
}
*/