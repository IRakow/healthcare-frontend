// src/pages/patient/MeditationSessionLog.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Session {
  id: string;
  mood: string;
  voice: string;
  duration: number;
  created_at: string;
}

export default function MeditationSessionLog() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const { data } = await supabase.from('meditation_sessions').select('*').order('created_at', { ascending: false });
    if (data) setSessions(data);
  }

  return (
    <div className="min-h-screen p-6 pb-24 bg-gradient-to-b from-white to-indigo-100">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">🧘 Session History</h1>

      <div className="max-w-2xl mx-auto space-y-4">
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground">No meditation sessions logged yet.</p>
        ) : (
          sessions.map((s) => (
            <Card key={s.id} className="bg-white/80 backdrop-blur shadow-md">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{s.mood} – {s.duration} min</div>
                  <Badge>{new Date(s.created_at).toLocaleString()}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Voice: {s.voice}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}