// src/pages/patient/PatientTrends.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchFromGemini } from '@/lib/ai/gemini';
import { speak } from '@/lib/voice/RachelTTSQueue';

export default function PatientTrends() {
  const [hydration, setHydration] = useState<any[]>([]);
  const [protein, setProtein] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  async function loadTrends() {
    const { data: hydrationData } = await supabase
      .from('vitals')
      .select('created_at, hydration')
      .order('created_at', { ascending: true })
      .limit(30);

    const { data: proteinData } = await supabase
      .from('meals')
      .select('created_at, protein')
      .order('created_at', { ascending: true })
      .limit(30);

    const hydrationFormatted = hydrationData?.map((d) => ({
      date: new Date(d.created_at).toLocaleDateString(),
      value: d.hydration
    })) || [];

    const proteinFormatted = proteinData?.map((d) => ({
      date: new Date(d.created_at).toLocaleDateString(),
      value: d.protein
    })) || [];

    setHydration(hydrationFormatted);
    setProtein(proteinFormatted);

    const prompt = `Hydration: ${JSON.stringify(hydrationFormatted)}. Protein: ${JSON.stringify(proteinFormatted)}. Summarize this data as if you are an AI health coach under the Mediterranean lifestyle.`;
    const response = await fetchFromGemini({ prompt });
    setSummary(response?.text || 'Unable to generate insights.');
    speak(response?.text);
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-6 pb-28 bg-gradient-to-b from-white via-sky-50 to-teal-100">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">📈 Health Trends</h1>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">💧 Hydration (last 30 entries)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hydration}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">🥩 Protein Intake (last 30 entries)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={protein}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {!loading && (
        <Card className="mt-6 bg-white/70 backdrop-blur shadow-lg max-w-3xl mx-auto">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">🧠 AI Insight</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {summary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}