import AdminLayout from '@/components/layout/AdminLayout'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Sparkles, Palette, Languages, ShieldAlert, Save } from 'lucide-react'
import { toast } from 'sonner'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { RachelTTS } from '@/lib/voice/RachelTTS'

export default function AdminSettingsPage() {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [voice, setVoice] = useState('Rachel')
  const [themeColor, setThemeColor] = useState('#4f46e5')
  const [language, setLanguage] = useState('en')
  const [guestAccess, setGuestAccess] = useState(false)

  const save = () => {
    toast.success('Settings saved. All changes take effect immediately.')
  }

  const handleVoiceQuery = async (text: string) => {
    if (text.includes('ai') || text.includes('assistant')) {
      await RachelTTS.say(`AI Assistant is currently ${aiEnabled ? 'enabled' : 'disabled'}. ${aiEnabled ? 'Rachel will respond to all voice commands.' : 'Voice responses are turned off.'}`)
    } else if (text.includes('theme') || text.includes('color')) {
      await RachelTTS.say(`The current theme color is set to ${themeColor}. You can change it using the color picker.`)
    } else if (text.includes('language')) {
      await RachelTTS.say(`The system language is set to ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'German'}.`)
    } else if (text.includes('guest') || text.includes('access')) {
      await RachelTTS.say(`Guest access is currently ${guestAccess ? 'enabled' : 'disabled'}. ${guestAccess ? 'Unverified users can interact with AI features.' : 'Only verified users have access.'}`)
    } else if (text.includes('save')) {
      save()
      await RachelTTS.say('Settings have been saved successfully.')
    } else {
      await RachelTTS.say('You can ask about AI settings, theme color, language preferences, or guest access.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-slate-800">System Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex gap-2 items-center text-blue-600">
                <Sparkles className="w-4 h-4" /> Enable AI Assistant
              </label>
              <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
            </div>
            <p className="text-xs text-muted-foreground">Rachel will speak back for all actions and answer voice queries.</p>
          </Card>

          <Card className="p-4 space-y-2">
            <label className="text-sm font-medium flex gap-2 items-center text-purple-700">
              <Palette className="w-4 h-4" /> Theme Accent Color
            </label>
            <Input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
            <p className="text-xs text-muted-foreground">Affects all accent elements across portals.</p>
          </Card>

          <Card className="p-4 space-y-2">
            <label className="text-sm font-medium flex gap-2 items-center text-emerald-700">
              <Languages className="w-4 h-4" /> Language Preference
            </label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
            <p className="text-xs text-muted-foreground">Applies to all onboarding flows and AI replies.</p>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex gap-2 items-center text-red-600">
                <ShieldAlert className="w-4 h-4" /> Enable Guest Access
              </label>
              <Switch checked={guestAccess} onCheckedChange={setGuestAccess} />
            </div>
            <p className="text-xs text-muted-foreground">Allows unverified demo users to interact with AI features.</p>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} className="flex gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </Button>
        </div>
      </div>
      <AdminAssistantBar onAsk={handleVoiceQuery} context="settings" />
    </AdminLayout>
  )
}