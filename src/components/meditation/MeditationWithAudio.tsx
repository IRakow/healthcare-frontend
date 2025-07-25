import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MeditationType, MEDITATION_TYPES } from '@/types/meditation';
import { MeditationAudioPlayer } from './MeditationAudioPlayer';
import { Play, CheckCircle } from 'lucide-react';

export function MeditationWithAudio() {
  const [selectedType, setSelectedType] = useState<MeditationType>('focus');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  async function startSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create meditation log
      const { data: log } = await supabase.from('meditation_logs').insert({
        user_id: user.id,
        type: selectedType,
        duration_minutes: selectedType === 'sleep' ? 10 : 5
      }).select().single();

      if (log) {
        setSessionId(log.id);
        setSessionStarted(true);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start meditation session');
    }
  }

  async function completeSession(audioUrl?: string) {
    if (!sessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update meditation log
      await supabase.from('meditation_logs').update({
        completed_at: new Date(),
        audio_url: audioUrl
      }).eq('id', sessionId);

      // Add to timeline
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'update',
        label: `Meditation Session – ${selectedType}`,
        data: { 
          duration: selectedType === 'sleep' ? 10 : 5, 
          completed_at: new Date(),
          audio_used: !!audioUrl
        }
      });

      alert('Great job! Meditation session completed.');
      
      // Reset
      setSessionStarted(false);
      setSessionId(null);
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }

  if (sessionStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">{MEDITATION_TYPES[selectedType].icon}</div>
            <h2 className="text-2xl font-bold mb-2">{MEDITATION_TYPES[selectedType].title}</h2>
            <p className="text-gray-600">{MEDITATION_TYPES[selectedType].description}</p>
          </div>
        </Card>

        <MeditationAudioPlayer 
          type={selectedType}
          onSessionComplete={completeSession}
        />

        <div className="text-center">
          <Button
            onClick={() => completeSession()}
            size="lg"
            variant="outline"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Complete Without Audio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Select Meditation Type</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(MEDITATION_TYPES).map(([key, meditation]) => (
          <Card key={key}>
            <button
              onClick={() => setSelectedType(key as MeditationType)}
              className={`w-full p-6 text-center transition-all ${
                selectedType === key ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-2">{meditation.icon}</div>
              <h3 className="font-semibold">{meditation.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{meditation.duration} min</p>
            </button>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button onClick={startSession} size="lg">
          <Play className="h-5 w-5 mr-2" />
          Start {MEDITATION_TYPES[selectedType].title}
        </Button>
      </div>
    </div>
  );
}