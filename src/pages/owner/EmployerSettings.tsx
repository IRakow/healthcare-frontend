export default function EmployerSettings() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏢 Employer Settings</h2>
      <p className="mb-4">Configure employer-wide health options and membership settings.</p>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Covered Appointments Per Year</label>
          <input type="number" className="input w-full" defaultValue={6} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Primary Contact Email</label>
          <input type="email" className="input w-full" placeholder="contact@company.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Enable Family Add-ons</label>
          <select className="input w-full">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button className="btn-primary mt-4">Save Settings</button>
      </form>
    </div>
  );
}