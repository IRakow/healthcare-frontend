import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, ArrowRight } from 'lucide-react';
import { handleCommand, getSuggestions, getAllCommands } from '@/utils/commandHandler';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(getAllCommands().slice(0, 5));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSuggestions(getSuggestions(query));
    setSelectedIndex(0);
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (suggestions[selectedIndex]) {
      navigate(suggestions[selectedIndex].route);
      onClose();
    } else if (query) {
      const success = handleCommand(query, navigate);
      if (success) {
        onClose();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-50"
        onClick={onClose}
      />
      
      {/* Command Palette */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center px-4 py-3 border-b">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 outline-none text-lg"
              />
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
          </form>
          
          {suggestions.length > 0 && (
            <div className="py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.route}
                  onClick={() => {
                    navigate(suggestion.route);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 ${
                    index === selectedIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium">{suggestion.description}</p>
                    <p className="text-sm text-gray-500">{suggestion.patterns[0]}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}