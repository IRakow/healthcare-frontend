import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { aiLoggingService } from '@/services/aiLoggingService';

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      setError('Please describe your symptoms');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/symptom-checker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const data = await response.json();
      setAnalysis(data.brief);
      
      // Log the symptom check
      await aiLoggingService.logSymptomCheck(symptoms, data.brief);
    } catch (err) {
      setError('Unable to analyze symptoms. Please try again.');
      console.error('Symptom analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Educational Symptom Checker</h1>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Educational Purpose Only</p>
          <p>This tool provides educational information about symptoms and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
        </div>
      </div>

      <Card title="Describe Your Symptoms">
        <div className="space-y-4">
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Please describe what you're experiencing... (e.g., 'headache and fever for 2 days')"
            rows={4}
            className="w-full"
          />
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <Button
            onClick={analyzeSymptoms}
            disabled={isLoading || !symptoms.trim()}
            variant="primary"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Educational Information
              </>
            )}
          </Button>
        </div>
      </Card>

      {analysis && (
        <Card title="Educational Information" className="mt-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{analysis}</div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Remember:</strong> Always consult with a qualified healthcare professional for accurate diagnosis and appropriate treatment.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}