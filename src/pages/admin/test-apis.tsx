import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestAPIs() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testGemini = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-gemini');
      
      if (error) {
        setResults(prev => ({ ...prev, gemini: { error: error.message } }));
      } else {
        setResults(prev => ({ ...prev, gemini: data }));
      }
    } catch (err) {
      setResults(prev => ({ ...prev, gemini: { error: err.message } }));
    }
    setLoading(false);
  };

  const testOpenAI = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-voice', {
        body: { input: 'Test OpenAI connection' }
      });
      
      if (error) {
        setResults(prev => ({ ...prev, openai: { error: error.message } }));
      } else {
        setResults(prev => ({ ...prev, openai: { success: true, response: data } }));
      }
    } catch (err) {
      setResults(prev => ({ ...prev, openai: { error: err.message } }));
    }
    setLoading(false);
  };

  const testElevenLabs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('eleven-speak', {
        body: { text: 'Test ElevenLabs connection' }
      });
      
      if (error) {
        setResults(prev => ({ ...prev, elevenlabs: { error: error.message } }));
      } else {
        setResults(prev => ({ ...prev, elevenlabs: { success: true, hasAudio: !!data?.audio_url } }));
      }
    } catch (err) {
      setResults(prev => ({ ...prev, elevenlabs: { error: err.message } }));
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">API Test Dashboard</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test API Connections</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={testGemini} disabled={loading}>
              Test Gemini API
            </Button>
            {results.gemini && (
              <div className="flex-1">
                {results.gemini.error ? (
                  <span className="text-red-500">❌ Error: {results.gemini.error}</span>
                ) : (
                  <span className="text-green-500">✅ Success: {results.gemini.apiResponse}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={testOpenAI} disabled={loading}>
              Test OpenAI API
            </Button>
            {results.openai && (
              <div className="flex-1">
                {results.openai.error ? (
                  <span className="text-red-500">❌ Error: {results.openai.error}</span>
                ) : (
                  <span className="text-green-500">✅ Success</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={testElevenLabs} disabled={loading}>
              Test ElevenLabs API
            </Button>
            {results.elevenlabs && (
              <div className="flex-1">
                {results.elevenlabs.error ? (
                  <span className="text-red-500">❌ Error: {results.elevenlabs.error}</span>
                ) : (
                  <span className="text-green-500">✅ Success - Audio generated</span>
                )}
              </div>
            )}
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Full Results:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}