import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MediaCheck() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  async function analyze() {
    if (!file || !userId) return;
    setUploading(true);

    try {
      const name = `${userId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('patient-media').upload(name, file, { upsert: true });
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('patient-media').getPublicUrl(name);
      const url = publicUrl;
    setPreview(url);

    const { data: { session } } = await supabase.auth.getSession();
    
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/media-analyze`, {
      method: 'POST',
      body: JSON.stringify({ file_url: url, type: file.type.startsWith('video') ? 'video' : 'photo' }),
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      }
    });

    const { summary } = await res.json();
    setSummary(summary);

      await supabase.from('patient_media').insert({
        patient_id: userId,
        file_url: url,
        type: file.type.startsWith('video') ? 'video' : 'photo',
        ai_summary: summary
      });

      await supabase.from('patient_timeline_events').insert({
        patient_id: userId,
        type: 'ai',
        label: `Media Analysis Submitted (${file.type})`,
        data: { file_url: url, summary }
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Analysis failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-blue-700">📸 AI Photo/Video Analysis</h1>
      <Card>
        <Input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
        <Button onClick={analyze} disabled={!file || uploading} className="mt-3">Submit</Button>
        {preview && <img src={preview} alt="preview" className="w-full mt-4 rounded-lg" />}
        {summary && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">AI Summary</h3>
            <p>{summary}</p>
          </div>
        )}
      </Card>
    </div>
  );
}