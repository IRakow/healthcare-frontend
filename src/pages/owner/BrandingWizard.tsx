export default function BrandingWizard() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎨 Brand Configuration</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Primary Color</label>
          <input type="color" className="input w-24 h-10 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company Logo</label>
          <input type="file" className="input w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Custom Voice (ElevenLabs)</label>
          <select className="input w-full">
            <option>Chill Phil</option>
            <option>Priyanka Sogam</option>
          </select>
        </div>
        <button className="btn-primary mt-4">Save Branding</button>
      </form>
    </div>
  );
}