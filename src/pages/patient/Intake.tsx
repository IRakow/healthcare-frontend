import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import { ConditionAutocomplete } from '@/components/ConditionAutocomplete';
import type { PatientIntake, IntakeFieldType } from '@/types/intake';

const FIELD_LABELS = {
  conditions: 'Medical Conditions',
  surgeries: 'Past Surgeries',
  allergies: 'Allergies',
  family_history: 'Family Medical History'
} as const;

const FIELD_PLACEHOLDERS = {
  conditions: 'e.g., Diabetes, Hypertension',
  surgeries: 'e.g., Appendectomy 2020',
  allergies: 'e.g., Penicillin, Peanuts',
  family_history: 'e.g., Mother - Breast Cancer'
} as const;

export default function Intake() {
  const navigate = useNavigate();
  const [intake, setIntake] = useState<Partial<PatientIntake>>({
    conditions: [],
    surgeries: [],
    allergies: [],
    family_history: []
  });
  const [inputs, setInputs] = useState<Record<IntakeFieldType, string>>({
    conditions: '',
    surgeries: '',
    allergies: '',
    family_history: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadIntake();
  }, []);

  async function loadIntake() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('patient_intake')
        .select('*')
        .eq('patient_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading intake:', error);
      } else if (data) {
        setIntake(data);
      }
    } catch (error) {
      console.error('Error loading intake:', error);
    } finally {
      setLoading(false);
    }
  }

  function addItem(type: IntakeFieldType) {
    const value = inputs[type].trim();
    if (!value) return;

    const currentItems = intake[type] || [];
    if (currentItems.includes(value)) {
      setMessage(`${value} already added`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIntake({
      ...intake,
      [type]: [...currentItems, value]
    });
    setInputs({ ...inputs, [type]: '' });
  }

  function removeItem(type: IntakeFieldType, index: number) {
    const currentItems = intake[type] || [];
    setIntake({
      ...intake,
      [type]: currentItems.filter((_, i) => i !== index)
    });
  }

  async function saveIntake() {
    setSaving(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('patient_intake')
        .select('id')
        .eq('patient_id', user.id)
        .maybeSingle();

      const intakeData = {
        patient_id: user.id,
        conditions: intake.conditions || [],
        surgeries: intake.surgeries || [],
        allergies: intake.allergies || [],
        family_history: intake.family_history || []
      };

      let error;
      if (existing?.id) {
        ({ error } = await supabase
          .from('patient_intake')
          .update(intakeData)
          .eq('patient_id', user.id));
      } else {
        ({ error } = await supabase
          .from('patient_intake')
          .insert(intakeData));
      }

      if (error) throw error;

      // Add timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'update',
        label: 'Medical History Updated',
        data: intakeData
      });

      setMessage('Medical history saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving intake:', error);
      setMessage('Error saving medical history');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center py-8">Loading medical history...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Medical History</h1>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {(Object.keys(FIELD_LABELS) as IntakeFieldType[]).map((type) => (
          <Card key={type} className="p-6">
            <h3 className="font-semibold text-lg mb-4">{FIELD_LABELS[type]}</h3>
            
            {intake[type] && intake[type]!.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {intake[type]!.map((item, index) => (
                  <Badge key={index} variant="secondary" className="py-1 px-3">
                    {item}
                    <button
                      onClick={() => removeItem(type, index)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-4">No {FIELD_LABELS[type].toLowerCase()} added yet</p>
            )}

            <div className="flex gap-2">
              {type === 'conditions' ? (
                <ConditionAutocomplete
                  value={inputs[type]}
                  onChange={(value) => setInputs({ ...inputs, [type]: value })}
                  onAdd={() => addItem(type)}
                  placeholder={FIELD_PLACEHOLDERS[type]}
                />
              ) : (
                <Input
                  value={inputs[type]}
                  onChange={(e) => setInputs({ ...inputs, [type]: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addItem(type)}
                  placeholder={FIELD_PLACEHOLDERS[type]}
                  className="flex-1"
                />
              )}
              <Button
                onClick={() => addItem(type)}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {type === 'allergies' && intake.allergies && intake.allergies.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 text-sm font-medium">⚠️ Allergy Alert</p>
                <p className="text-red-600 text-sm">Please inform all healthcare providers about these allergies.</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={saveIntake} disabled={saving} className="min-w-[120px]">
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save History
            </>
          )}
        </Button>
      </div>
    </div>
  );
}