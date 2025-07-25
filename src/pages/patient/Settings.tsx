import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/Toast';

export default function PatientSettings() {
  const [userData, setUserData] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user?.id)
          .single();
        setUserData(data || {});
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function updateField(field: string, value: any) {
    setUserData({ ...userData, [field]: value });
  }

  async function saveChanges() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          dob: userData.dob,
          assistant_tone: userData.assistant_tone,
          notifications_enabled: userData.notifications_enabled
        })
        .eq('id', userData.id);

      if (error) {
        alert('Error saving settings: ' + error.message);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center py-8">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          ← Back
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Personal Info</h2>
        
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name"
            value={userData.full_name || ''} 
            onChange={(e) => updateField('full_name', e.target.value)} 
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            value={userData.email || ''} 
            disabled 
            className="bg-gray-50"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone"
            type="tel"
            value={userData.phone || ''} 
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input 
            id="dob"
            type="date" 
            value={userData.dob || ''} 
            onChange={(e) => updateField('dob', e.target.value)} 
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Assistant Preferences</h2>
        
        <div>
          <Label htmlFor="tone">Communication Style</Label>
          <select 
            id="tone"
            className="w-full border rounded p-2 text-sm mt-1" 
            value={userData.assistant_tone || 'professional'} 
            onChange={(e) => updateField('assistant_tone', e.target.value)}
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="concise">Concise</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            How would you like the AI assistant to communicate with you?
          </p>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={userData.notifications_enabled ?? true} 
            onChange={(e) => updateField('notifications_enabled', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Enable appointment reminders & health alerts</span>
        </label>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Data Export</h2>
        <p className="text-sm text-gray-600 mb-4">
          Download your complete health record as a PDF file
        </p>
        <Button onClick={() => navigate('/patient/export-pdf')}>
          📄 Export My Record (PDF)
        </Button>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={saveChanges}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {saved && <Toast message="Settings updated!" />}
    </div>
  );
}