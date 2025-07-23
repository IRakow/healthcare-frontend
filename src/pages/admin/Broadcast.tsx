import { useState } from 'react';

export default function Broadcast() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    alert(`Broadcast sent: ${message}`);
    setMessage('');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📣 Send Broadcast Message</h2>
      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="input w-full mb-2"
        placeholder="Enter message to all users..."
      />
      <button onClick={handleSend} className="btn-primary w-full">Send Broadcast</button>
    </div>
  );
}