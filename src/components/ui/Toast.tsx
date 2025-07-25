import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export function Toast({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg animate-fade-in z-50 flex items-center gap-2">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}