import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VoiceTranscribeButton from '@/components/VoiceTranscribeButton';

interface SearchWithVoiceProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchWithVoice({ 
  onSearch, 
  placeholder = "Search or speak..." 
}: SearchWithVoiceProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleTranscription = (text: string) => {
    setQuery(text);
    // Optionally auto-submit after transcription
    if (text.trim()) {
      onSearch(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <VoiceTranscribeButton
        onTranscription={handleTranscription}
        duration={5000}
      />
      <Button type="submit" variant="primary">
        Search
      </Button>
    </form>
  );
}