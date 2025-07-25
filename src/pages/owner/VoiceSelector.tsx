import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const voices = [
  { name: 'Rachel', sample: 'https://cdn.elevenlabs.io/samples/rachel.mp3' },
  { name: 'Adam', sample: 'https://cdn.elevenlabs.io/samples/adam.mp3' },
  { name: 'Bella', sample: 'https://cdn.elevenlabs.io/samples/bella.mp3' },
];

export default function VoiceSelector() {
  const [selected, setSelected] = useState('');

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Choose Default Voice</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {voices.map((v) => (
          <Card key={v.name}>
            <p className="text-md font-medium mb-2">{v.name}</p>
            <audio controls src={v.sample} className="w-full" />
            <Button
              variant={selected === v.name ? 'primary' : 'secondary'}
              onClick={() => setSelected(v.name)}
              className="mt-2"
            >
              {selected === v.name ? 'Selected' : 'Select'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}