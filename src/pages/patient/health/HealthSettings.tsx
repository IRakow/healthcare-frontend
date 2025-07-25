import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

export default function HealthSettings() {
  const [form, setForm] = useState({
    track_food: false,
    use_wearables: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('patient_profile')
      .select('track_food, use_wearables')
      .eq('id', user.id)
      .single();

    if (data) {
      setForm({
        track_food: data.track_food || false,
        use_wearables: data.use_wearables || false
      });
    }
  }

  async function updateSetting(field: string, value: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newForm = { ...form, [field]: value };
    setForm(newForm);

    await supabase
      .from('patient_profile')
      .update({ [field]: value })
      .eq('id', user.id);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">⚙️ Health Preferences</h1>
      
      <Card className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={form.track_food} 
            onChange={(e) => updateSetting('track_food', e.target.checked)}
            className="w-5 h-5"
          /> 
          <span className="text-lg">🍽 Track my food daily</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={form.use_wearables} 
            onChange={(e) => updateSetting('use_wearables', e.target.checked)}
            className="w-5 h-5"
          /> 
          <span className="text-lg">⌚ Use my wearable for lifestyle tips</span>
        </label>
      </Card>
    </div>
  );
}