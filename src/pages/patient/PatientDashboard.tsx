// src/pages/patient/PatientDashboard.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AssistantBarOverlay from '@/components/ai/AssistantBarOverlay';
import { handleRachelIntent } from '@/lib/voice/rachelIntentRouter';

export default function PatientDashboard() {
  const [patient, setPatient] = useState<any>(null);
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: user, error } = await supabase.auth.getUser();
    if (\!error && user) {
      const { data: profile } = await supabase.from('patients').select('*').eq('user_id', user.user.id).single();
      setPatient(profile);
      generateSummary(profile);
    }
  }

  async function generateSummary(profile: any) {
    const { data: meals } = await supabase.from('meals').select('*').eq('user_id', profile.user_id).limit(5);
    const { data: vitals } = await supabase.from('vitals').select('*').eq('user_id', profile.user_id).limit(5);
    const compiled = `Here are recent meals and vitals: Meals - ${meals?.length || 0}, Vitals - ${vitals?.length || 0}.`;
    const { text } = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: compiled, context: 'Summarize this patient's health and lifestyle trend in a helpful way.' })
    }).then((res) => res.json());
    setSummary(text);
  }

  return (
    <div className="min-h-screen p-6 pb-24 space-y-8 bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <h1 className="text-3xl font-bold tracking-tight text-center">Welcome, {patient?.first_name || 'Patient'} 🌿</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-xl bg-white/70">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-2">AI Summary</h2>
            <p className="text-sm text-muted-foreground min-h-[80px]">{summary || 'Generating your summary...'}</p>
          </CardContent>
        </Card>

        <Card className="shadow-xl bg-white/70">
          <CardContent className="p-4 space-y-2">
            <h2 className="font-semibold text-lg">My Goals</h2>
            <p className="text-sm">{patient?.goals || 'No goals saved. Tell Rachel\!'}</p>
            <Button size="sm" variant="outline">Update Goals</Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl bg-white/70">
          <CardContent className="p-4 space-y-2">
            <h2 className="font-semibold text-lg">Allergies</h2>
            <p className="text-sm">{patient?.allergies || 'None listed.'}</p>
            <Button size="sm" variant="outline">Update Allergies</Button>
          </CardContent>
        </Card>
      </div>

      <AssistantBarOverlay onSubmit={(text) => handleRachelIntent(text, 'patient')} />
    </div>
  );
}
