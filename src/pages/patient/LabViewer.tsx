import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LabViewer() {
  const [labs, setLabs] = useState([]);
  const [explanations, setExplanations] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    (async () => {
      const user = supabase.auth.user();
      const { data } = await supabase.from('lab_results').select('*').eq('patient_id', user.id).order('date', { descending: true });
      setLabs(data || []);
    })();
  }, []);

  async function explainLab(lab: any, index: number) {
    const key = `lab-${index}`;
    
    // Toggle explanation if already loaded
    if (explanations[key]) {
      setExplanations(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      return;
    }

    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/functions/v1/explain-lab', {
        method: 'POST',
        body: JSON.stringify({ panel: lab.panel, results: lab.results }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const { summary } = await res.json();
      setExplanations(prev => ({ ...prev, [key]: summary }));
    } catch (error) {
      console.error('Error getting explanation:', error);
      alert('Failed to get explanation. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🧪 Lab Results</h1>

      {labs.map((lab, i) => (
        <Card key={i} title={`${lab.panel} — ${lab.date}`}>
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-1">Test</th>
                <th className="pb-1">Value</th>
                <th className="pb-1">Reference</th>
              </tr>
            </thead>
            <tbody>
              {(lab.results || []).map((r: any, j: number) => (
                <tr key={j} className="border-b">
                  <td>{r.name}</td>
                  <td className="font-medium">{r.value} {r.unit}</td>
                  <td className="text-gray-500">{r.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4">
            <Button 
              onClick={() => explainLab(lab, i)} 
              className="mt-2"
              disabled={loading[`lab-${i}`]}
            >
              {loading[`lab-${i}`] ? (
                'Loading...'
              ) : explanations[`lab-${i}`] ? (
                '🔽 Hide Explanation'
              ) : (
                '💡 Explain My Results'
              )}
            </Button>
          </div>
          
          {explanations[`lab-${i}`] && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Explanation:</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{explanations[`lab-${i}`]}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}