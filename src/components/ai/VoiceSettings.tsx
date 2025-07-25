import { useState } from 'react';
import { Volume2, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const VOICES = [
  { id: 'rachel', name: 'Rachel', description: 'Calm and articulate' },
  { id: 'domi', name: 'Domi', description: 'Confident and clear' },
  { id: 'bella', name: 'Bella', description: 'Warm and expressive' },
  { id: 'antoni', name: 'Antoni', description: 'Well-rounded and versatile' },
  { id: 'elli', name: 'Elli', description: 'Youthful and energetic' },
  { id: 'josh', name: 'Josh', description: 'Deep and resonant' },
  { id: 'arnold', name: 'Arnold', description: 'Strong and assertive' },
  { id: 'adam', name: 'Adam', description: 'Deep and authoritative' },
  { id: 'sam', name: 'Sam', description: 'Raspy and unique' },
];

const MODELS = [
  { id: 'eleven_monolingual_v1', name: 'Standard' },
  { id: 'eleven_multilingual_v1', name: 'Multilingual' },
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2' },
];

interface VoiceSettingsProps {
  onVoiceChange?: (voice: string) => void;
  onModelChange?: (model: string) => void;
}

export function VoiceSettings({ onVoiceChange, onModelChange }: VoiceSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [selectedModel, setSelectedModel] = useState('eleven_monolingual_v1');
  const { speak, isSpeaking } = useTextToSpeech();

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    onVoiceChange?.(voice);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onModelChange?.(model);
  };

  const testVoice = () => {
    const voice = VOICES.find(v => v.id === selectedVoice);
    speak(
      `Hello! I'm ${voice?.name}. ${voice?.description}. How can I assist you today?`,
      { voice: selectedVoice, model: selectedModel }
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Voice Settings
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Voice Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="voice-select">Voice</Label>
                <Select
                  value={selectedVoice}
                  onChange={handleVoiceChange}
                  options={VOICES.map(voice => ({
                    value: voice.id,
                    label: `${voice.name} - ${voice.description}`
                  }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="model-select">Model</Label>
                <Select
                  value={selectedModel}
                  onChange={handleModelChange}
                  options={MODELS.map(model => ({
                    value: model.id,
                    label: model.name
                  }))}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={testVoice}
                disabled={isSpeaking}
                className="w-full"
                variant="secondary"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                {isSpeaking ? 'Speaking...' : 'Test Voice'}
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              <p>Powered by ElevenLabs AI Voice Technology</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}