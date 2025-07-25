import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stethoscope, Loader2 } from 'lucide-react';

export default function DifferentialDiagnosis() {
  const [symptoms, setSymptoms] = useState('');
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);

  const getDifferentialBrief = async () => {
    if (!symptoms.trim()) return;

    setLoading(true);
    setBrief('');

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/differential-brief`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });
      
      const { brief } = await res.json();
      setBrief(brief || 'No analysis available');
    } catch (error) {
      console.error('Error:', error);
      setBrief('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Differential Diagnosis Tool</h2>
      
      <Card>
        <div className="space-y-4">
          <Input
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Enter symptoms (e.g., headache, vision changes, dizziness)"
            onKeyPress={(e) => e.key === 'Enter' && getDifferentialBrief()}
          />
          
          <Button
            onClick={getDifferentialBrief}
            disabled={loading || !symptoms.trim()}
            variant="primary"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4 mr-2" />
                Get Differential Diagnosis
              </>
            )}
          </Button>
        </div>
      </Card>

      {brief && (
        <Card className="mt-4">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm">{brief}</pre>
          </div>
        </Card>
      )}
    </div>
  );
}