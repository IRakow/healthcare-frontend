import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings, 
  Bell, 
  Mic, 
  Globe, 
  Shield, 
  Smartphone,
  Save,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface UserSettings {
  ai_voice_enabled: boolean;
  daily_reminders: boolean;
  preferred_voice: string;
  language: string;
  two_factor_enabled: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  reminder_time: string;
  timezone: string;
}

const defaultSettings: UserSettings = {
  ai_voice_enabled: true,
  daily_reminders: true,
  preferred_voice: 'Rachel',
  language: 'en',
  two_factor_enabled: false,
  push_notifications: true,
  email_notifications: true,
  sms_notifications: false,
  reminder_time: '09:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

export const PatientSettingsPanel: React.FC = () => {
  const { userId } = useUser();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Settings className="w-5 h-5" /> Settings
      </h3>

      {/* Voice & AI Settings */}
      <Card className="p-4 space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Mic className="w-4 h-4 text-purple-600" /> Voice & AI
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">Enable AI Voice Assistant</p>
              <p className="text-xs text-muted-foreground">Use voice commands and get spoken responses</p>
            </div>
            <Switch 
              checked={settings.ai_voice_enabled} 
              onCheckedChange={(checked) => updateSetting('ai_voice_enabled', checked)} 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Voice</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={settings.preferred_voice}
              onChange={(e) => updateSetting('preferred_voice', e.target.value)}
              disabled={!settings.ai_voice_enabled}
            >
              <option value="Rachel">Rachel (Female, US)</option>
              <option value="Adam">Adam (Male, US)</option>
              <option value="Bella">Bella (Female, UK)</option>
              <option value="Antoni">Antoni (Male, UK)</option>
              <option value="Elli">Elli (Female, Neutral)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-4 space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" /> Notifications
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">Daily Health Reminders</p>
              <p className="text-xs text-muted-foreground">Get reminders for medications and check-ins</p>
            </div>
            <Switch 
              checked={settings.daily_reminders} 
              onCheckedChange={(checked) => updateSetting('daily_reminders', checked)} 
            />
          </div>

          {settings.daily_reminders && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Reminder Time</label>
              <input
                type="time"
                value={settings.reminder_time}
                onChange={(e) => updateSetting('reminder_time', e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Push Notifications</p>
            <Switch 
              checked={settings.push_notifications} 
              onCheckedChange={(checked) => updateSetting('push_notifications', checked)} 
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Email Notifications</p>
            <Switch 
              checked={settings.email_notifications} 
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)} 
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">SMS Notifications</p>
            <Switch 
              checked={settings.sms_notifications} 
              onCheckedChange={(checked) => updateSetting('sms_notifications', checked)} 
            />
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-4 space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Globe className="w-4 h-4 text-green-600" /> Preferences
        </h4>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Timezone</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card className="p-4 space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-600" /> Security
        </h4>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </div>
          <Switch 
            checked={settings.two_factor_enabled} 
            onCheckedChange={(checked) => updateSetting('two_factor_enabled', checked)} 
          />
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};