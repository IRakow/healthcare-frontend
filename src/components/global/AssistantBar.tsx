import { useEffect, useState, useRef } from 'react'
import { Mic, Send, Loader2, Sparkles, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

interface AssistantBarProps {
  role?: 'patient' | 'provider' | 'owner' | 'admin'
  context?: string
  compact?: boolean
  autoFocus?: boolean
}

export function AssistantBar({ role = 'patient', context, compact = false, autoFocus = false }: AssistantBarProps) {
  const [message, setMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [navOpen, setNavOpen] = useState(false)
  const recognitionRef = useRef<any>(null)

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.93
    utterance.pitch = 1
    const voices = speechSynthesis.getVoices()
    utterance.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Aria')) || voices[0]
    speechSynthesis.speak(utterance)
  }

  const sendToAI = async (inputText: string) => {
    console.log('Sending to AI:', inputText)
    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('ai-voice-navigator', {
        body: { role, input: inputText, context }
      })
      
      if (error) {
        console.error('Supabase function error:', error)
        setResponse('Sorry, there was an error processing your request.')
        setIsLoading(false)
        return
      }
      
      console.log('AI Response:', data)
      const reply = data?.response || 'No response received from AI'
      setResponse(reply)
      speak(reply)
    } catch (err) {
      console.error('Error calling AI:', err)
      setResponse('Sorry, I encountered an error.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return alert('Speech Recognition not supported')

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setMessage(transcript)
      sendToAI(transcript)
    }

    recognition.onerror = (e: any) => console.error('Speech error', e)
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const handleSend = () => {
    console.log('handleSend called with message:', message)
    if (message.trim()) {
      const currentMessage = message
      setMessage('') // Clear the input immediately
      sendToAI(currentMessage)
    }
  }

  const navConfig = {
    patient: [
      { name: 'Dashboard', href: '/patient/dashboard' },
      { name: 'My Health', href: '/patient/health' },
      { name: 'Appointments', href: '/patient/appointments' },
      { name: 'Medications', href: '/patient/medications' },
      { name: 'Labs', href: '/patient/labs' },
      { name: 'Messages', href: '/patient/messages' }
    ],
    provider: [
      { name: 'Dashboard', href: '/provider/dashboard' },
      { name: 'Patients', href: '/provider/patients' },
      { name: 'Analytics', href: '/provider/analytics' },
      { name: 'Schedule', href: '/provider/schedule' },
      { name: 'Messages', href: '/provider/messages' }
    ],
    owner: [
      { name: 'Overview', href: '/owner/dashboard' },
      { name: 'Companies', href: '/owner/employers' },
      { name: 'Invoices', href: '/owner/billing' },
      { name: 'Settings', href: '/owner/settings' }
    ],
    admin: [
      { name: 'Dashboard', href: '/admin/dashboard' },
      { name: 'Users', href: '/admin/users' },
      { name: 'Logs', href: '/admin/logs' },
      { name: 'Settings', href: '/admin/settings' }
    ]
  }
  
  const navItems = navConfig[role] || []

  return (
    <>
      {navOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 shadow-2xl border rounded-2xl p-4 z-[99] max-w-lg w-[95%] grid gap-2 text-center"
        >
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="block text-sm font-medium text-zinc-800 dark:text-zinc-100 hover:text-emerald-600 transition py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800">
              {item.name}
            </a>
          ))}
        </motion.div>
      )}

      <motion.div
        className={`${
          compact 
            ? 'flex items-center gap-2 p-2' 
            : 'fixed bottom-5 left-5 right-5 z-50 max-w-4xl mx-auto flex items-center gap-3 bg-white/80 dark:bg-zinc-800/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700 rounded-3xl shadow-xl p-4'
        } transition-all`}
        initial={{ opacity: 0, y: compact ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: compact ? 0 : 20 }}
      >
        {!compact && (
          <Button size="icon" variant="ghost" onClick={() => setNavOpen(!navOpen)}>
            <Menu className="w-5 h-5 text-zinc-700 dark:text-white" />
          </Button>
        )}
        <Sparkles className={`text-emerald-500 ${compact ? 'h-3 w-3' : 'h-4 w-4'} shrink-0 animate-pulse`} />
        <Input
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          placeholder={compact ? "Ask me anything..." : "Talk to your assistant..."}
          className={`flex-1 bg-white/50 dark:bg-zinc-900/40 backdrop-blur-sm rounded-xl border-none focus-visible:ring-0 ${
            compact ? 'text-sm h-9' : 'text-[15px]'
          }`}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleSend()
            }
          }}
          autoFocus={autoFocus}
        />
        <Button 
          variant="ghost" 
          size={compact ? "sm" : "icon"} 
          onClick={handleVoice} 
          className="hover:bg-emerald-100 dark:hover:bg-emerald-800/30"
        >
          <Mic className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${isListening ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`} />
        </Button>
        <Button 
          variant="ghost" 
          size={compact ? "sm" : "icon"} 
          onClick={handleSend} 
          disabled={isLoading} 
          className="hover:bg-emerald-100 dark:hover:bg-emerald-800/30"
        >
          {isLoading ? <Loader2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} /> : <Send className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-600`} />}
        </Button>
      </motion.div>
    </>
  )
}