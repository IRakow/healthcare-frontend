// File: src/components/assistant/AssistantBar.tsx

import { useEffect, useState, useRef } from 'react';
import { Mic, Send, Loader2, Sparkles, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { voiceAPI } from '@/services/voiceAPI';
import { conversationService } from '@/services/conversationService';
import { motion } from 'framer-motion';

interface AssistantBarProps {
  role: 'patient' | 'provider';
}

export default function AssistantBar({ role }: AssistantBarProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [navOpen, setNavOpen] = useState(false);

  const speak = async (text: string) => {
    try {
      const audioBuffer = await voiceAPI.textToSpeech(text);
      const audio = new Audio(URL.createObjectURL(new Blob([audioBuffer])));
      audio.play();
    } catch (err) {
      console.error('Voice playback failed:', err);
    }
  };

  const sendToAI = async (inputText: string) => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      let output = '';
      await voiceAPI.streamAIResponse(inputText, (chunk) => {
        output += chunk;
      });
      await speak(output);
      await conversationService.saveConversation(inputText, output);
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoice = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech Recognition not supported');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      sendToAI(transcript);
    };

    recognition.onerror = (e: any) => console.error('Speech error:', e);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSend = () => {
    if (message.trim()) {
      sendToAI(message);
      setMessage('');
    }
  };

  const navLinks = {
    patient: [
      { name: 'Dashboard', href: '/patient/dashboard' },
      { name: 'Health', href: '/patient/health-dashboard' },
      { name: 'Appointments', href: '/patient/appointments' },
      { name: 'Medications', href: '/patient/medications' },
      { name: 'Labs', href: '/patient/labs' },
      { name: 'Settings', href: '/patient/settings' },
    ],
    provider: [
      { name: 'Dashboard', href: '/provider/dashboard' },
      { name: 'Patients', href: '/provider/patients' },
      { name: 'Visits', href: '/provider/visits' },
      { name: 'Analytics', href: '/provider/analytics' },
      { name: 'Messages', href: '/provider/messages/inbox' },
      { name: 'Settings', href: '/provider/settings' },
    ]
  }[role];

  return (
    <>
      {navOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md border shadow-xl rounded-xl px-6 py-4 space-y-2 max-w-md w-[90%]"
        >
          {navLinks.map(({ name, href }) => (
            <a
              key={href}
              href={href}
              className="block text-sm font-medium text-gray-800 hover:text-emerald-600 transition"
            >
              {name}
            </a>
          ))}
        </motion.div>
      )}

      <motion.div
        className="fixed bottom-5 left-5 right-5 z-50 max-w-4xl mx-auto flex items-center gap-3 bg-white/90 backdrop-blur border rounded-full shadow-lg p-4 transition-all"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Button size="icon" variant="ghost" onClick={() => setNavOpen(!navOpen)}>
          <Menu className="w-5 h-5 text-gray-700" />
        </Button>
        <Sparkles className="text-emerald-500 h-4 w-4 shrink-0 animate-pulse" />
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 bg-white/50 backdrop-blur-sm rounded-xl border-none focus-visible:ring-0 text-sm"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <Button variant="ghost" size="icon" onClick={handleVoice}>
          <Mic className={`w-5 h-5 ${isListening ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`} />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleSend} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-emerald-600" />}
        </Button>
      </motion.div>
    </>
  );
}
