import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">Welcome to Your Health Hub</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/records')}>
          <h3 className="text-lg font-semibold mb-2">🩺 My Records</h3>
          <p className="text-sm text-gray-600">View past visits, AI chats, labs, vitals & uploads</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/meditation')}>
          <h3 className="text-lg font-semibold mb-2">🧘 Meditation</h3>
          <p className="text-sm text-gray-600">Start a guided or ambient session now</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/nutrition')}>
          <h3 className="text-lg font-semibold mb-2">🥗 Food Log</h3>
          <p className="text-sm text-gray-600">Snap photos or log meals by voice</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/appointments')}>
          <h3 className="text-lg font-semibold mb-2">📅 Appointments</h3>
          <p className="text-sm text-gray-600">Book or review upcoming visits</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/labs')}>
          <h3 className="text-lg font-semibold mb-2">🧪 Lab Results</h3>
          <p className="text-sm text-gray-600">Securely view your recent lab reports</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/wearables')}>
          <h3 className="text-lg font-semibold mb-2">📊 Wearables</h3>
          <p className="text-sm text-gray-600">Integrate data from Apple Health, Oura, and more</p>
        </Card>
      </div>
    </div>
  );
}