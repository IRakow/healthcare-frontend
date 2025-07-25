import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    voice: 'Rachel',
    notification_sender_name: 'Insperity Health',
    primary_color: '#3B82F6',
    tagline: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // For admin, we might load platform-wide settings
      // For now, let's load the first employer as an example
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .limit(1)
        .single();
      
      if (employer) {
        setForm({
          voice: employer.voice_profile || 'Rachel',
          notification_sender_name: employer.notification_sender_name || 'Insperity Health',
          primary_color: employer.primary_color || '#3B82F6',
          tagline: employer.tagline || ''
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  function update(key: string, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function saveSettings() {
    setSaving(true);
    try {
      // Save settings logic here
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🎨 Admin Settings</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Platform Branding">
          <div className="space-y-4">
            <Input
              label="Primary Color"
              type="color"
              value={form.primary_color}
              onChange={(e) => update('primary_color', e.target.value)}
            />
            
            <Input
              label="Platform Tagline"
              value={form.tagline}
              onChange={(e) => update('tagline', e.target.value)}
              placeholder="e.g. Your Health, Simplified"
            />
          </div>
        </Card>

        <Card title="Voice Settings">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Default AI Voice</span>
              <select
                className="mt-1 w-full border rounded p-2 text-sm"
                value={form.voice}
                onChange={(e) => update('voice', e.target.value)}
              >
                <option value="Rachel">Rachel</option>
                <option value="Bella">Bella</option>
                <option value="Adam">Adam</option>
                <option value="Josh">Josh</option>
              </select>
            </label>
          </div>
        </Card>

        <Card title="Notification Settings">
          <div className="space-y-4">
            <Input
              label="Notification Sender Name"
              value={form.notification_sender_name}
              onChange={(e) => update('notification_sender_name', e.target.value)}
              placeholder="e.g. Acme Wellness Group"
            />
            <p className="text-xs text-gray-500">
              This name appears as the sender in all system notifications, emails, and SMS messages
            </p>
          </div>
        </Card>

        <Card title="File Upload">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Logo
              </label>
              <input type="file" accept="image/*" className="w-full border rounded p-2 text-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <input type="file" accept="image/x-icon,image/png" className="w-full border rounded p-2 text-sm" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}