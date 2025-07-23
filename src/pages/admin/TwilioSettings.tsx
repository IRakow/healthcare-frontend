import { useState } from 'react';

export default function TwilioSettings() {
  const [reminders, setReminders] = useState(true);
  const [fromNumber, setFromNumber] = useState('+18885551234');

  const saveSettings = () => {
    alert('✅ Settings saved! (In real app, this writes to Supabase config table.)');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">📣 Text Reminder Configuration</h2>
      <div className="space-y-4 mt-4">
        <label className="block text-sm font-medium">Enable Appointment Reminders</label>
        <input type="checkbox" checked={reminders} onChange={(e) => setReminders(e.target.checked)} />

        <label className="block text-sm font-medium">Twilio Sender Number</label>
        <input type="text" value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} className="input" />

        <button onClick={saveSettings} className="btn-primary">Save</button>
      </div>
    </div>
  );
}