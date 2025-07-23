import { useState } from 'react';

export default function HealthAIChat() {
  const [messages, setMessages] = useState([{ from: 'ai', text: 'Hi! What health topic can I help you explore today?' }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input) return;
    setMessages([...messages, { from: 'user', text: input }, { from: 'ai', text: `Here's what I found on: ${input}` }]);
    setInput('');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">💬 Ask Our Health AI</h2>
      <div className="bg-gray-100 rounded p-4 h-64 overflow-y-auto mb-4">
        {messages.map((m, i) => (
          <div key={i} className={m.from === 'ai' ? 'text-blue-600' : 'text-gray-900'}>
            <p><strong>{m.from === 'ai' ? 'AI:' : 'You:'}</strong> {m.text}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="input w-full mb-2"
        placeholder="Ask something..."
      />
      <button onClick={handleSend} className="btn-primary w-full">Send</button>
    </div>
  );
}