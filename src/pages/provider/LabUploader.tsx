import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function LabUploader() {
  const [patientId, setPatientId] = useState('');
  const [panel, setPanel] = useState('');
  const [date, setDate] = useState('');
  const [json, setJson] = useState('');
  const [saving, setSaving] = useState(false);

  async function upload() {
    setSaving(true);
    const parsed = JSON.parse(json);

    await supabase.from('lab_results').insert({
      patient_id: patientId,
      panel,
      date,
      results: parsed
    });

    await supabase.from('patient_timeline_events').insert({
      patient_id: patientId,
      type: 'lab',
      label: `Lab Panel: ${panel}`,
      data: { results: parsed }
    });

    alert('Lab uploaded!');
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">Upload Lab Results</h1>
      <Card>
        <Input label="Patient ID" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        <Input label="Panel Name" value={panel} onChange={(e) => setPanel(e.target.value)} />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Textarea rows={6} label="Lab Results (JSON array)" value={json} onChange={(e) => setJson(e.target.value)} placeholder={`[\n  { "name": "Glucose", "value": 92, "unit": "mg/dL", "reference": "70-99" }\n]`} />
        <Button onClick={upload} disabled={saving}>Upload Lab</Button>
      </Card>
    </div>
  );
}