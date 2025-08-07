// File: src/pages/patient/Meditation.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PatientLayoutSimple from '@/components/layout/PatientLayoutSimple';
import { Bot, Music, Play, Volume2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const musicTracks = {
  calm: '/audio/calm.mp3',
  focus: '/audio/focus.mp3',
  gratitude: '/audio/gratitude.mp3'
};

export default function MeditationPage() {
  const [topic, setTopic] = useState('relaxation and inner calm');
  const [voice, setVoice] = useState('Bella');
  const [includeMusic, setIncludeMusic] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('calm');
  const [musicReady, setMusicReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [meditationText, setMeditationText] = useState<string>('');
  const [musicStarted, setMusicStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio(musicTracks[selectedTrack]);
    audio.loop = true;
    audio.oncanplaythrough = () => setMusicReady(true);
    audio.load();

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [selectedTrack]);

  async function generateMeditation() {
    setIsLoading(true);
    setAudioUrl(null);
    setMeditationText('');
    setVoiceReady(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-meditation-audio', {
        body: { 
          topic, 
          voice, 
          includeMusic, 
          model: 'gemini',
          duration: 10
        }
      });

      if (error) throw error;

      if (data) {
        setAudioUrl(data.audio_url);
        setMeditationText(data.text);
        setVoiceReady(true);
        
        // If music is requested, play background music alongside
        if (includeMusic && data.audio_url) {
          const bgMusic = new Audio(musicTracks[selectedTrack]);
          bgMusic.volume = 0.15; // Very soft background
          bgMusic.loop = true;
          
          const voiceAudio = new Audio(data.audio_url);
          voiceAudio.volume = 1.0;
          
          // Start both if music is ready
          if (musicReady) {
            voiceAudio.play();
            bgMusic.play();
            setIsPlaying(true);
            setMusicStarted(true);
          }
          
          // Stop music when voice ends
          voiceAudio.addEventListener('ended', () => {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            setIsPlaying(false);
            setMusicStarted(false);
          });
        }
      }
    } catch (e) {
      console.error('Failed to generate meditation:', e);
      alert('Failed to generate meditation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PatientLayoutSimple>
      <motion.div
        className="max-w-2xl mx-auto p-6 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-center text-emerald-800">🧘‍♀️ Guided Meditation</h1>
        <p className="text-center text-sm text-gray-500">
          Choose a topic and voice to generate your AI-guided session.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border rounded-lg mt-1"
              placeholder="e.g. deep sleep, anxiety relief"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Voice</label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full p-2 border rounded-lg mt-1"
            >
              <option value="Bella">Bella (Soothing Female)</option>
              <option value="Adam">Adam (Calm Male)</option>
              <option value="Arabella">Arabella (Ethereal Female)</option>
              <option value="Ana-Rita">Ana-Rita (Portuguese Calm)</option>
              <option value="Michael">Michael (Urban UK)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={includeMusic}
              onChange={(e) => setIncludeMusic(e.target.checked)}
            />
            <Music className="w-4 h-4 text-blue-500" />
            Include ambient background music
          </label>

          {includeMusic && (
            <div className="space-y-4">
              <label htmlFor="music-select" className="block font-medium text-gray-700">
                Choose Background Music
              </label>
              <select
                id="music-select"
                value={selectedTrack}
                onChange={(e) => {
                  setMusicReady(false);
                  setSelectedTrack(e.target.value);
                }}
                className="w-full p-2 rounded border"
              >
                <option value="calm">🌊 Calm</option>
                <option value="focus">🧘 Focus</option>
                <option value="gratitude">🙏 Gratitude</option>
              </select>

              {!musicReady ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500" />
                  <p>Preparing music...</p>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    const audio = new Audio(musicTracks[selectedTrack]);
                    audio.loop = true;
                    audio.play();
                    setIsPlaying(true);
                  }}
                  className="w-full"
                >
                  {isPlaying ? 'Music Playing...' : 'Start Music'}
                </Button>
              )}
            </div>
          )}

          <Button className="w-full mt-4" onClick={generateMeditation} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Meditation'}
          </Button>
        </div>

        {audioUrl && (
          <div className="bg-white rounded-xl shadow p-4 mt-6">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Meditation Player
            </h3>
            {!voiceReady ? (
              <div className="text-center text-gray-500 animate-pulse mb-3">
                <p>Loading voice...</p>
              </div>
            ) : (
              <div className="text-green-600 text-sm mb-2">✓ Voice ready</div>
            )}
            <audio src={audioUrl} controls className="w-full" autoPlay />
            <p className="text-xs text-gray-500 mt-1">Sit back and relax while your personalized session plays.</p>
            
            {meditationText && (
              <details className="mt-4">
                <summary className="text-sm font-medium text-gray-600 cursor-pointer">View Meditation Script</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 max-h-48 overflow-y-auto">
                  {meditationText}
                </div>
              </details>
            )}
          </div>
        )}
      </motion.div>
    </PatientLayoutSimple>
  );
}