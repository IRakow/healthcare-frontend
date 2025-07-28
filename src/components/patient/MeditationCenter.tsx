import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/select';
import { Music, Mic, Clock } from 'lucide-react';

interface MeditationSettings {
  voice: string;
  topic: string;
  duration: number;
  withMusic: boolean;
}

export const MeditationCenter: React.FC = () => {
  const [settings, setSettings] = useState<MeditationSettings>({
    voice: 'Bella',
    topic: 'Relaxation',
    duration: 10,
    withMusic: true
  });

  const handleChange = <K extends keyof MeditationSettings>(key: K, value: MeditationSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const startMeditation = () => {
    // TODO: Send config to ElevenLabs + AI engine
    console.log('Starting meditation session:', settings);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-5"
    >
      <h3 className="text-xl font-semibold text-gray-800">Create a Guided Meditation</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <Select
          label="Voice"
          options={[
            { label: 'Bella', value: 'Bella' },
            { label: 'Adam', value: 'Adam' },
            { label: 'Rachel', value: 'Rachel' }
          ]}
          value={settings.voice}
          onChange={(v) => handleChange('voice', v)}
        />
        <Select
          label="Topic"
          options={[
            { label: 'Relaxation', value: 'Relaxation' },
            { label: 'Sleep', value: 'Sleep' },
            { label: 'Focus', value: 'Focus' },
            { label: 'Breathing', value: 'Breathing' },
            { label: 'Self-Compassion', value: 'Self-Compassion' }
          ]}
          value={settings.topic}
          onChange={(v) => handleChange('topic', v)}
        />
        <Select
          label="Duration"
          options={[
            { label: '5 minutes', value: '5' },
            { label: '10 minutes', value: '10' },
            { label: '15 minutes', value: '15' },
            { label: '20 minutes', value: '20' }
          ]}
          value={settings.duration.toString()}
          onChange={(v) => handleChange('duration', Number(v))}
        />
        <Select
          label="Music"
          options={[
            { label: 'With Music', value: 'With Music' },
            { label: 'No Music', value: 'No Music' }
          ]}
          value={settings.withMusic ? 'With Music' : 'No Music'}
          onChange={(v) => handleChange('withMusic', v === 'With Music')}
        />
      </div>

      <Button onClick={startMeditation} className="mt-2">Start Meditation</Button>
    </motion.div>
  );
};