import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LabReview() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnreviewedLabs();
  }, []);

  async function loadUnreviewedLabs() {
    try {
      const { data } = await supabase
        .from('lab_results')
        .select('*')
        .eq('reviewed', false)
        .order('date', { descending: true });
      
      setLabs(data || []);
    } catch (error) {
      console.error('Error loading labs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markReviewed(labId: string) {
    try {
      const { error } = await supabase
        .from('lab_results')
        .update({ reviewed: true })
        .eq('id', labId);

      if (!error) {
        // Remove from list
        setLabs(labs.filter(lab => lab.id !== labId));
        
        // Add to timeline
        const lab = labs.find(l => l.id === labId);
        if (lab) {
          await supabase.from('patient_timeline_events').insert({
            patient_id: lab.patient_id,
            type: 'lab',
            label: `Lab Review: ${lab.panel}`,
            data: { 
              lab_id: labId,
              reviewed_by: 'provider',
              reviewed_at: new Date()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error marking lab as reviewed:', error);
      alert('Failed to mark as reviewed');
    }
  }

  async function explainLab(lab: any) {
    const res = await fetch('/functions/v1/explain-lab', {
      method: 'POST',
      body: JSON.stringify({ panel: lab.panel, results: lab.results }),
      headers: { 'Content-Type': 'application/json' }
    });

    const { summary } = await res.json();
    alert(summary);
  }

  if (loading) {
    return (
      <div className="p-6 max-w-screen-lg mx-auto">
        <div className="text-center">Loading labs for review...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-700">🔬 Lab Review Queue</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {labs.length} Pending Review
        </Badge>
      </div>

      {labs.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-600">✅ All labs have been reviewed!</p>
          </div>
        </Card>
      ) : (
        labs.map((lab, i) => (
          <Card key={i} title={`${lab.panel} — ${lab.date}`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-700">Patient ID: {lab.patient_id}</p>
                <Badge variant="outline" className="text-xs">
                  Needs Review
                </Badge>
              </div>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-1">Test</th>
                    <th className="pb-1">Value</th>
                    <th className="pb-1">Reference</th>
                    <th className="pb-1">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {(lab.results || []).map((r: any, j: number) => {
                    const isAbnormal = r.flag === 'high' || r.flag === 'low' || r.abnormal;
                    return (
                      <tr key={j} className={`border-b ${isAbnormal ? 'bg-red-50' : ''}`}>
                        <td className="py-1">{r.name}</td>
                        <td className="font-medium">{r.value} {r.unit}</td>
                        <td className="text-gray-500">{r.reference}</td>
                        <td>
                          {isAbnormal && (
                            <span className="text-red-600 font-medium">
                              {r.flag || 'Abnormal'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => markReviewed(lab.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✓ Mark Reviewed
                </Button>
                <Button 
                  onClick={() => explainLab(lab)}
                  variant="outline"
                >
                  💡 AI Explanation
                </Button>
                <Button 
                  onClick={() => window.location.href = `/provider/patient/${lab.patient_id}`}
                  variant="outline"
                >
                  View Patient
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}