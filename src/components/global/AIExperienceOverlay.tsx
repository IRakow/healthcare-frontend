import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Mic, X } from 'lucide-react';
import { AssistantBar } from '@/components/global/AssistantBar';

interface AIExperienceOverlayProps {
  context: 'patient' | 'provider' | 'admin' | 'owner';
}

const contextConfig = {
  patient: {
    title: 'Health AI Guide',
    greeting: '👋 I\'m your health assistant. I can help you:',
    features: [
      '🧠 Analyze your meal photo or label',
      '🍽 Plan a full Mediterranean menu',
      '🛒 Build your grocery list',
      '📈 Interpret your vitals and macros',
      '💬 Answer any health-related questions'
    ]
  },
  provider: {
    title: 'Provider AI Assistant',
    greeting: '👋 I\'m your clinical assistant. I can help you:',
    features: [
      '📋 Generate SOAP notes from visits',
      '🔍 Search patient records quickly',
      '📊 Analyze patient trends and risks',
      '💊 Check drug interactions',
      '📅 Manage your appointment schedule'
    ]
  },
  admin: {
    title: 'Admin AI Assistant',
    greeting: '👋 I\'m your admin assistant. I can help you:',
    features: [
      '👥 Manage user accounts and permissions',
      '📊 Generate system analytics reports',
      '🔍 Search audit logs and activities',
      '⚙️ Monitor system health and performance',
      '📈 Track platform usage metrics'
    ]
  },
  owner: {
    title: 'Business AI Assistant',
    greeting: '👋 I\'m your business assistant. I can help you:',
    features: [
      '💰 Generate invoice summaries',
      '📊 Analyze revenue trends',
      '🏢 Manage employer accounts',
      '📈 Track platform growth metrics',
      '💳 Process billing and payouts'
    ]
  }
};

export const AIExperienceOverlay: React.FC<AIExperienceOverlayProps> = ({ context }) => {
  const [open, setOpen] = useState(false);
  const config = contextConfig[context];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="w-[380px] max-w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-700 p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> {config.title}
              </h3>
              <button 
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-snug space-y-2">
              <p>{config.greeting}</p>
              <ul className="list-disc list-inside text-sm pl-3 space-y-1">
                {config.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <p>Just type or say what you need. I'm listening.</p>
            </div>
            <AssistantBar role={context} context={context} autoFocus compact />
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <Button 
          onClick={() => setOpen(true)} 
          variant="secondary" 
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Mic className="w-4 h-4" /> Ask AI
        </Button>
      )}
    </div>
  );
};

// Convenience exports for specific roles
export const PatientAIOverlay = () => <AIExperienceOverlay context="patient" />;
export const ProviderAIOverlay = () => <AIExperienceOverlay context="provider" />;
export const AdminAIOverlay = () => <AIExperienceOverlay context="admin" />;
export const OwnerAIOverlay = () => <AIExperienceOverlay context="owner" />;