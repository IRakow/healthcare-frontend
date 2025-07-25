import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { saveLabResults } from '@/utils/labUtils';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Upload } from 'lucide-react';

interface LabResultInput {
  name: string;
  value: string;
  unit: string;
  reference: string;
}

export function LabUploader({ patientId }: { patientId?: string }) {
  const [panel, setPanel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<LabResultInput[]>([
    { name: '', value: '', unit: '', reference: '' }
  ]);
  const [uploading, setUploading] = useState(false);

  function addResult() {
    setResults([...results, { name: '', value: '', unit: '', reference: '' }]);
  }

  function removeResult(index: number) {
    setResults(results.filter((_, i) => i !== index));
  }

  function updateResult(index: number, field: keyof LabResultInput, value: string) {
    const updated = [...results];
    updated[index][field] = value;
    setResults(updated);
  }

  async function handleUpload() {
    if (!panel || results.some(r => !r.name || !r.value)) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetPatientId = patientId || user?.id;

      if (!targetPatientId) {
        alert('No patient ID available');
        return;
      }

      const validResults = results.filter(r => r.name && r.value);
      const { success } = await saveLabResults(targetPatientId, panel, date, validResults);

      if (success) {
        alert('Lab results uploaded successfully!');
        // Reset form
        setPanel('');
        setResults([{ name: '', value: '', unit: '', reference: '' }]);
      } else {
        alert('Failed to upload lab results');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading lab results');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Upload Lab Results</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Panel Name"
            value={panel}
            onChange={(e) => setPanel(e.target.value)}
            placeholder="e.g., Metabolic Panel"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Test Results</label>
          {results.map((result, index) => (
            <div key={index} className="flex gap-2 items-end">
              <Input
                placeholder="Test name"
                value={result.name}
                onChange={(e) => updateResult(index, 'name', e.target.value)}
              />
              <Input
                placeholder="Value"
                value={result.value}
                onChange={(e) => updateResult(index, 'value', e.target.value)}
              />
              <Input
                placeholder="Unit"
                value={result.unit}
                onChange={(e) => updateResult(index, 'unit', e.target.value)}
              />
              <Input
                placeholder="Reference"
                value={result.reference}
                onChange={(e) => updateResult(index, 'reference', e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeResult(index)}
                disabled={results.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={addResult}>
            <Plus className="h-4 w-4 mr-2" />
            Add Test
          </Button>
          
          <Button onClick={handleUpload} disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Results'}
          </Button>
        </div>
      </div>
    </Card>
  );
}