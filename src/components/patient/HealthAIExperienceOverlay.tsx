import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Mic, X } from 'lucide-react';
import { AssistantBar } from '@/components/global/AssistantBar';

export const HealthAIExperienceOverlay: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="w-[380px] max-w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Health AI Guide
              </h3>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="text-sm text-gray-700 leading-snug space-y-2">
              <p>👋 I'm your health assistant. I can help you:</p>
              <ul className="list-disc list-inside text-sm pl-3 space-y-1">
                <li>🧠 Analyze your meal photo or label</li>
                <li>🍽 Plan a full Mediterranean menu</li>
                <li>🛒 Build your grocery list</li>
                <li>📈 Interpret your vitals and macros</li>
                <li>💬 Answer any health-related questions</li>
              </ul>
              <p>Just type or say what you need. I'm listening.</p>
            </div>
            <AssistantBar context="patient" autoFocus compact />
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <Button onClick={() => setOpen(true)} variant="secondary" className="flex items-center gap-2 shadow-lg">
          <Mic className="w-4 h-4" /> Ask AI
        </Button>
      )}
    </div>
  );
};