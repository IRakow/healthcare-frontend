import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AssistantBarProps {
  role: 'patient' | 'provider' | 'owner';
  patientId?: string;
  mode?: 'info_synth' | 'chat' | 'command';
}

export default function AssistantBar({ role, patientId, mode = 'chat' }: AssistantBarProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // TODO: Integrate with your AI service
      // For now, just echo back
      const assistantMessage = {
        role: 'assistant',
        content: `I'm here to help you with your ${role === 'patient' ? 'health' : 'work'} needs. You said: "${input}"`
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Assistant error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] shadow-xl flex flex-col">
      <div className="p-4 border-b bg-blue-50">
        <h3 className="font-semibold">AI Assistant</h3>
        <p className="text-xs text-gray-600">
          {mode === 'info_synth' ? 'Information Synthesis Mode' : 
           mode === 'command' ? 'Command Mode' : 'Chat Mode'}
        </p>
        {patientId && (
          <p className="text-xs text-gray-500 mt-1">Patient context loaded</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">
            {mode === 'info_synth' 
              ? 'I can help you understand your health data and records.'
              : 'How can I assist you today?'}
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-100">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'command' ? 'Enter command...' : 'Type your message...'}
            className="flex-1"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button onClick={handleSubmit} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
}