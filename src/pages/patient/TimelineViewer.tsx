// src/pages/patient/TimelineViewer.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const categories = ['All', 'Visits', 'Labs', 'Uploads', 'AI'];

export default function TimelineViewer() {
  async function generateRachelInsight(data: any[]) {
    const summary = `Summarize these patient timeline events in one helpful insight: ${data.map(e => `${e.type}: ${e.title}`).join(', ')}`;
    const res = await fetch('/api/ai/rachel-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: summary })
    });
    const result = await res.json();
    setRachelInsight(result?.text || 'Rachel couldn't generate insights at this time.');
  }
  const { user } = useUser();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [rachelInsight, setRachelInsight] = useState('');

  useEffect(() => {
    async function fetchTimeline() {
      const { data } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false });
      setItems(data || []);
      generateRachelInsight(data);
    }
    if (user?.id) fetchTimeline();
  }, [user]);

  const filtered =
    filter === 'All' ? items : items.filter((e) => e.type === filter.toLowerCase());

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-slate-800 text-center mb-6"
      >
        📆 Your Medical Timeline
      </motion.h1>

      <Tabs defaultValue="All" className="max-w-3xl mx-auto mb-6">
        <TabsList className="grid grid-cols-5 bg-white border shadow rounded-xl">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              onClick={() => setFilter(cat)}
              className="text-sm"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative border-l-2 border-slate-300 max-w-3xl mx-auto space-y-6 pl-4">
        {filtered.map((event, i) => (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="relative pl-6"
          >
            <div className="absolute left-[-14px] top-1 w-3 h-3 bg-slate-600 rounded-full"></div>
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardContent className="py-3 px-4">
                <div className="text-xs text-slate-500 mb-1">{new Date(event.timestamp).toLocaleString()}</div>
                <div className="font-medium text-slate-800 mb-1">{event.title}</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{event.details}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-12 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-xl p-6 relative overflow-hidden">
  <div className="absolute inset-0 z-0 animate-pulse bg-blue-100 opacity-5 rounded-xl" />
  <div className="relative z-10">
    <p className="text-blue-900 font-semibold text-lg mb-2 animate-pulse">🧠 Rachel's Monthly Insight</p>
    <motion.p className="text-sm text-blue-800 mb-4 italic tracking-wide bg-white/50 border-l-4 border-blue-300 pl-4 py-2 rounded shadow-sm">
      {rachelInsight || 'Rachel is preparing your monthly summary...'}
    </motion.p>
    <input 
      type="text"
      placeholder="Ask Rachel about your health timeline..."
      className="w-full max-w-sm px-4 py-2 border border-blue-300 rounded-md text-sm text-blue-900 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition duration-300"
    />
  </div>
</div>
    </div>
  );
}