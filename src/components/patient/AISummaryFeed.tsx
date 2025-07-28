// File: src/components/patient/AISummaryFeed.tsx

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Bot } from 'lucide-react';

interface AISummary {
  id: string;
  question: string;
  response: string;
  created_at: string;
}

interface AISummaryFeedProps {
  userId: string;
}

export const AISummaryFeed: React.FC<AISummaryFeedProps> = ({ userId }) => {
  const supabase = useSupabaseClient();
  const [summaries, setSummaries] = useState<AISummary[]>([]);

  useEffect(() => {
    const fetchSummaries = async () => {
      const { data, error } = await supabase
        .from('ai_logs')
        .select('id, question, response, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AISummaryFeed] Supabase error:', error);
        return;
      }

      setSummaries(data);
    };

    fetchSummaries();
  }, [userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Summary Feed</h3>
      {summaries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No AI interactions yet.</p>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div key={summary.id} className="border-l-4 border-primary pl-4">
              <div className="flex items-start gap-2">
                <Bot className="w-4 h-4 text-primary mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Q: {summary.question}</p>
                  <p className="text-sm text-gray-600 mt-1">A: {summary.response}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(summary.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};