import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ROUTES = {
  dashboard: '/patient',
  labs: '/patient/labs',
  medications: '/patient/medications',
  appointments: '/patient/appointments',
  calendar: '/patient/calendar',
  invoices: '/employer/invoices',
  settings: '/patient/settings',
};

export function SimpleCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  function handleSearch() {
    const lowerQuery = query.toLowerCase();
    const key = Object.keys(ROUTES).find((r) => r.includes(lowerQuery));
    if (key) {
      navigate(ROUTES[key as keyof typeof ROUTES]);
      setOpen(false);
      setQuery('');
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={() => setOpen(false)} 
      />
      
      {/* Command Palette */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-96 bg-white shadow-lg rounded-xl p-4 z-50">
        <input
          type="text"
          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a command or page..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          autoFocus
        />
        
        {/* Show available commands */}
        {query && (
          <div className="mt-3 space-y-1">
            {Object.keys(ROUTES)
              .filter(key => key.includes(query.toLowerCase()))
              .map(key => (
                <button
                  key={key}
                  onClick={() => {
                    navigate(ROUTES[key as keyof typeof ROUTES]);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))
            }
          </div>
        )}
        
        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded">⌘K</kbd> to toggle
        </div>
      </div>
    </>
  );
}

// Usage in your app:
/*
import { SimpleCommandPalette } from '@/components/SimpleCommandPalette';

function App() {
  return (
    <>
      <YourAppContent />
      <SimpleCommandPalette />
    </>
  );
}
*/