import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Select from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';
import { AssistantModel, AssistantTone, AssistantVoice, Employer } from '@/types/employer';

const models: { value: AssistantModel; label: string }[] = [
  { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast)' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus (Advanced)' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet (Balanced)' },
  { value: 'gemini-pro', label: 'Gemini Pro (Google)' },
];

const tones: { value: AssistantTone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'concise', label: 'Concise' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'casual', label: 'Casual' },
];

const voices: { value: AssistantVoice; label: string }[] = [
  { value: 'Rachel', label: 'Rachel (Female, American)' },
  { value: 'Adam', label: 'Adam (Male, American)' },
  { value: 'Bella', label: 'Bella (Female, American)' },
  { value: 'Domi', label: 'Domi (Female, American)' },
  { value: 'Antoni', label: 'Antoni (Male, American)' },
  { value: 'Elli', label: 'Elli (Female, American)' },
  { value: 'Josh', label: 'Josh (Male, American)' },
  { value: 'Arnold', label: 'Arnold (Male, American)' },
  { value: 'Sam', label: 'Sam (Male, American)' },
];

export default function AssistantConfig() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [selectedEmployer, setSelectedEmployer] = useState<string>('');
  const [config, setConfig] = useState({
    assistant_model: 'gpt-4' as AssistantModel,
    assistant_tone: 'professional' as AssistantTone,
    assistant_voice: 'Rachel' as AssistantVoice,
    assistant_temp: 0.7,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEmployers();
  }, []);

  useEffect(() => {
    if (selectedEmployer) {
      loadEmployerConfig(selectedEmployer);
    }
  }, [selectedEmployer]);

  const loadEmployers = async () => {
    const { data, error } = await supabase
      .from('employers')
      .select('*')
      .order('name');

    if (!error && data) {
      setEmployers(data);
      if (data.length > 0) {
        setSelectedEmployer(data[0].id);
      }
    }
  };

  const loadEmployerConfig = async (employerId: string) => {
    const employer = employers.find(e => e.id === employerId);
    if (employer) {
      setConfig({
        assistant_model: employer.assistant_model || 'gpt-4',
        assistant_tone: employer.assistant_tone || 'professional',
        assistant_voice: employer.assistant_voice || 'Rachel',
        assistant_temp: employer.assistant_temp || 0.7,
      });
    }
  };

  const saveConfig = async () => {
    if (!selectedEmployer) return;

    setSaving(true);
    const { error } = await supabase
      .from('employers')
      .update(config)
      .eq('id', selectedEmployer);

    if (error) {
      alert('Failed to save configuration');
    } else {
      alert('Configuration saved successfully');
      loadEmployers(); // Reload to get updated data
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Assistant Configuration</h1>

      <Card title="Select Employer" className="mb-6">
        <Select
          label="Choose Employer"
          value={selectedEmployer}
          onChange={(e: any) => setSelectedEmployer(e.target.value)}
          options={[
            { label: 'Select an employer', value: '' },
            ...employers.map(emp => ({ label: emp.name, value: emp.id }))
          ]}
        />
      </Card>

      {selectedEmployer && (
        <Card title="Assistant Settings">
          <div className="space-y-6">
            <div>
              <Select
                label="AI Model"
                value={config.assistant_model}
                onChange={(e: any) => setConfig({ ...config, assistant_model: e.target.value })}
                options={models}
              />
              <p className="text-sm text-gray-500 mt-1">
                Choose the AI model that powers the assistant
              </p>
            </div>

            <div>
              <Select
                label="Conversation Tone"
                value={config.assistant_tone}
                onChange={(e: any) => setConfig({ ...config, assistant_tone: e.target.value })}
                options={tones}
              />
              <p className="text-sm text-gray-500 mt-1">
                Sets how the assistant communicates
              </p>
            </div>

            <div>
              <Select
                label="Voice"
                value={config.assistant_voice}
                onChange={(e: any) => setConfig({ ...config, assistant_voice: e.target.value })}
                options={voices}
              />
              <p className="text-sm text-gray-500 mt-1">
                Voice for text-to-speech responses
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: {config.assistant_temp.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.assistant_temp}
                onChange={(e) => setConfig({ ...config, assistant_temp: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused (0.0)</span>
                <span>Balanced (0.7)</span>
                <span>Creative (2.0)</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Controls response creativity vs consistency
              </p>
            </div>

            <Button
              onClick={saveConfig}
              disabled={saving || !selectedEmployer}
              variant="primary"
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}