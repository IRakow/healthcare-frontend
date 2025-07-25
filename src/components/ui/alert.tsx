import * as React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface AlertProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  className?: string;
}

export default function Alert({ type = 'info', title, message, className = '' }: AlertProps) {
  const [visible, setVisible] = React.useState(true);
  const iconMap = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
  };

  const colorMap = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        role="alert"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={cn(
          `flex items-start gap-3 p-4 border rounded-xl shadow-sm ${colorMap[type]} backdrop-blur-md bg-opacity-80`,
          className
        )}
      >
        <div className="mt-0.5">{iconMap[type]}</div>
        <div>
          <p className="font-semibold text-sm mb-0.5">{title}</p>
          <p className="text-sm leading-snug">{message}</p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-auto mt-0.5 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// Export Alert and AlertDescription for backward compatibility
export const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm [&_p]:leading-relaxed">{children}</div>
);

export { Alert };