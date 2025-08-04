// src/pages/patient/MedicationManager.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { fetchFromGemini } from '@/lib/ai/gemini';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  reason: string;
  started_on: string;
}

export default function MedicationManager() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', reason: '' });
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMeds();
  }, []);

  async function loadMeds() {
    const { data } = await supabase.from('medications').select('*').order('started_on', { ascending: false });
    if (data) setMeds(data);
  }

  async function handleAdd() {
    setLoading(true);
    const { error } = await supabase.from('medications').insert({ ...newMed, started_on: new Date().toISOString() });
    if (!error) {
      setNewMed({ name: '', dosage: '', reason: '' });
      loadMeds();
      const ai = await fetchFromGemini({
        prompt: `Check if there are any safety concerns or interactions with this medication in a general patient context: ${newMed.name}, ${newMed.dosage}, for ${newMed.reason}.`,
        context: 'You are a safety-first AI medication advisor. Do not give medical advice. Only explain potential red flags and suggest follow-up with a provider.'
      });
      speak(ai?.text);
      setSummary(ai?.text || '');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-6 pb-32 bg-gradient-to-b from-white via-red-50 to-rose-100">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">💊 Medication Manager</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/80 backdrop-blur-xl">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">➕ Add Medication</h2>
            <Input
              placeholder="Medication name"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
            />
            <Input
              placeholder="Dosage (e.g. 10mg daily)"
              value={newMed.dosage}
              onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
            />
            <Textarea
              placeholder="Reason or condition"
              value={newMed.reason}
              onChange={(e) => setNewMed({ ...newMed, reason: e.target.value })}
            />
            <Button onClick={handleAdd} disabled={loading}>
              {loading ? 'Saving...' : 'Add Medication'}
            </Button>

            {summary && (
              <div className="p-3 text-sm text-muted-foreground border rounded-md bg-white/70">
                <strong>⚠️ AI Safety Note:</strong>
                <br />
                {summary}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">📋 Current Medications</h2>
          {meds.length === 0 ? (
            <p className="text-muted-foreground">No medications added yet.</p>
          ) : (
            meds.map((med) => (
              <Card key={med.id} className="bg-white/70 shadow-md">
                <CardContent className="p-3">
                  <div className="font-medium">{med.name}</div>
                  <p className="text-sm text-muted-foreground">{med.dosage}</p>
                  <p className="text-sm italic">{med.reason}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}