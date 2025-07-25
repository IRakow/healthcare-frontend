import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function SOAPGenerator() {
  const [transcript, setTranscript] = useState('');
  const [soap, setSOAP] = useState('');
  const [patientId, setPatientId] = useState('');
  const [saving, setSaving] = useState(false);

  async function generate() {
    const res = await fetch('/functions/v1/soap-gen', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { soap_note } = await res.json();
    setSOAP(soap_note);
  }

  async function saveNote() {
    setSaving(true);
    await supabase.from('patient_timeline_events').insert({
      patient_id: patientId,
      type: 'visit',
      label: 'SOAP Note (AI Generated)',
      data: { soap },
    });
    alert('SOAP note saved to timeline!');
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🧠 Generate SOAP Note (Gemini)</h1>

      <Card title="Step 1: Paste Transcript or Summary">
        <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={10} placeholder="Conversation, visit notes, symptoms..." />
        <Button onClick={generate} className="mt-3">Generate SOAP Note</Button>
      </Card>

      {soap && (
        <Card title="Generated SOAP Note">
          <pre className="whitespace-pre-wrap text-sm">{soap}</pre>
          <Input label="Patient ID" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
          <Button onClick={saveNote} disabled={!patientId || saving} className="mt-2">
            Save to Timeline
          </Button>
        </Card>
      )}
    </div>
  );
}