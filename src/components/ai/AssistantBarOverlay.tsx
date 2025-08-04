// src/components/ai/AssistantBarOverlay.tsx

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AssistantBarOverlayProps {
  onSubmit: (text: string) => void;
}

export default function AssistantBarOverlay({ onSubmit }: AssistantBarOverlayProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 z-50">
      <div className="max-w-xl mx-auto flex gap-2 backdrop-blur-lg bg-white/80 p-3 rounded-xl shadow-xl">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 text-sm"
          placeholder="Type a Rachel command (e.g. promote John to admin)"
        />
        <Button onClick={handleSubmit} size="sm">
          Run
        </Button>
      </div>
    </div>
  );
}