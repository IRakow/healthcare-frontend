// src/pages/patient/ProgressPhotos.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloudIcon, BotIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchFromGemini } from '@/lib/ai/gemini';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

export default function ProgressPhotos() {
  const { user } = useUser();
  const [photos, setPhotos] = useState<{ date: string; url: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadPhotos() {
      const { data } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPhotos(
          data.map((item: any) => ({
            url: item.url,
            date: new Date(item.created_at).toLocaleDateString()
          }))
        );
      }
    }
    if (user?.id) loadPhotos();
  }, [user]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('progress-photos').upload(fileName, file);
    if (!error) {
      const url = supabase.storage.from('progress-photos').getPublicUrl(fileName).data.publicUrl;
      await supabase.from('progress_photos').insert({ user_id: user.id, url });
      setPhotos([{ url, date: new Date().toLocaleDateString() }, ...photos]);
    }
    setUploading(false);
  }

  async function runRachelOverlay() {
    setLoading(true);
    const latestTwo = photos.slice(0, 2);
    const prompt = `You are Rachel, a supportive health AI. Compare two progress photos of the same patient taken at different times. Describe visible body changes like posture, muscle tone, waistline, or overall shape. Be supportive, concise, and non-judgmental. Include any visual cues worth highlighting.`;

    const res = await fetchFromGemini({
      prompt,
      image_urls: latestTwo.map((p) => p.url)
    });

    setAnalysis(res?.text || 'No differences detected.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-purple-50 to-indigo-100">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-indigo-700 text-center mb-4"
      >
        📸 Progress Photos
      </motion.h1>
      <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
        Upload and view your transformation journey. Rachel can help highlight your visual progress over time.
      </p>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map(({ date, url }) => (
          <motion.div
            key={url}
            whileHover={{ scale: 1.03 }}
            className="relative cursor-pointer"
            onClick={() => setSelected(url)}
          >
            <Card className="overflow-hidden shadow-lg border border-purple-100">
              <img src={url} alt={date} className="w-full h-60 object-cover transition-transform duration-300 hover:scale-105" />
              <CardContent className="p-2 text-center text-sm text-purple-800">{date}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 max-w-md mx-auto text-center space-y-4">
        <label className="block text-sm font-medium text-gray-700">Upload a new photo</label>
        <Input type="file" onChange={handleUpload} className="bg-white border border-gray-300 rounded-md" />
        <Button disabled={uploading} className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 mx-auto">
          <UploadCloudIcon className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </div>

      {photos.length >= 2 && (
        <div className="mt-16 max-w-lg mx-auto text-center">
          <Button
            onClick={runRachelOverlay}
            disabled={loading}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-3 rounded-full shadow flex gap-2 items-center justify-center"
          >
            <BotIcon className="w-4 h-4" /> {loading ? 'Analyzing Photos...' : 'Rachel Overlay Analysis'}
          </Button>

          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 bg-white/90 p-6 rounded-xl shadow border border-purple-200 text-sm text-purple-800"
            >
              {analysis}
            </motion.div>
          )}
        </div>
      )}

      {photos.length >= 2 && (
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-purple-700 text-center mb-4">🆚 Swipe Compare</h2>
          <div className="relative w-full aspect-[4/3] bg-white rounded-xl overflow-hidden border border-purple-200 shadow">
            <div className="absolute inset-0 w-1/2 overflow-hidden">
              <img src={photos[1].url} className="object-cover w-full h-full" />
            </div>
            <div className="absolute inset-0">
              <img src={photos[0].url} className="object-cover w-full h-full opacity-50" />
            </div>
          </div>
        </div>
      )}

      {selected && (
        <motion.div
          key={selected}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-xl">
            <img src={selected} className="w-full h-auto" alt="Full photo" />
            <div className="text-right p-4">
              <Button onClick={() => setSelected(null)} variant="ghost" className="text-sm text-gray-600">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}