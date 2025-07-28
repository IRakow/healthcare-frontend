import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AIConversationLogger } from '@/components/patient/AIConversationLogger';

export default function PatientAIHistoryPage() {
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting AI conversation history...');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant History</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>
      <AIConversationLogger />
    </motion.div>
  );
}