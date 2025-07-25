import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DrugAutocomplete } from '@/components/DrugAutocomplete';

const STRENGTHS = ['25 mg', '50 mg', '100 mg', '250 mg', '500 mg', '1 g'];
const FREQUENCY = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'As needed'];

export default function Medications() {
  const [meds, setMeds] = useState([]);
  const [newMed, setNewMed] = useState({ name: '', strength: '', dosage: '', frequency: '' });
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMedications();
  }, []);

  async function loadMedications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });
      setMeds(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setNewMed({ ...newMed, [field]: value });
  }

  async function addMed() {
    if (!newMed.name) {
      alert('Please enter medication name');
      return;
    }

    setAdding(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...newMed, patient_id: user?.id };
      const { data, error } = await supabase
        .from('medications')
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      
      setMeds([data, ...meds]);
      setNewMed({ name: '', strength: '', dosage: '', frequency: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Failed to add medication');
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    try {
      await supabase
        .from('medications')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      setMeds(meds.map(med => 
        med.id === id ? { ...med, is_active: !currentStatus } : med
      ));
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Medications</h1>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          ← Back
        </Button>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          + Add Medication
        </Button>
      ) : (
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Add New Medication</h3>
          
          <div>
            <Label htmlFor="name">Medication Name *</Label>
            <DrugAutocomplete 
              value={newMed.name} 
              onChange={(val) => update('name', val)} 
            />
            {newMed.name.toLowerCase() === 'ibuprofen' && (
              <p className="text-red-600 text-sm mt-2">⚠️ Ibuprofen may be unsafe for those with kidney disease or ulcers. Please consult a provider.</p>
            )}
            {newMed.name.toLowerCase() === 'lisinopril' && (
              <p className="text-red-600 text-sm mt-2">⚠️ Lisinopril can increase potassium. Avoid potassium supplements unless prescribed.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strength">Strength</Label>
              <select
                id="strength"
                className="w-full p-2 border rounded"
                value={newMed.strength}
                onChange={(e) => update('strength', e.target.value)}
              >
                <option value="">Select strength</option>
                {STRENGTHS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={newMed.dosage}
                onChange={(e) => update('dosage', e.target.value)}
                placeholder="e.g., 1 tablet"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <select
              id="frequency"
              className="w-full p-2 border rounded"
              value={newMed.frequency}
              onChange={(e) => update('frequency', e.target.value)}
            >
              <option value="">Select frequency</option>
              {FREQUENCY.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={addMed} disabled={adding}>
              {adding ? 'Adding...' : 'Add Medication'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">Loading medications...</div>
      ) : meds.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No medications added yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Keep track of your medications here
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {meds.map((med) => (
            <Card key={med.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{med.name}</h3>
                  <div className="space-y-1 mt-2 text-sm text-gray-600">
                    {med.strength && <p>Strength: {med.strength}</p>}
                    {med.dosage && <p>Dosage: {med.dosage}</p>}
                    {med.frequency && <p>Frequency: {med.frequency}</p>}
                  </div>
                </div>
                <Badge
                  variant={med.is_active ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => toggleActive(med.id, med.is_active)}
                >
                  {med.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Added {new Date(med.created_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}