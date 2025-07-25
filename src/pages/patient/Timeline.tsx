import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import TimelineViewer from '@/components/patient/TimelineViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Filter } from 'lucide-react';

const EVENT_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'update', label: 'Updates' },
  { value: 'upload', label: 'Uploads' },
  { value: 'ai', label: 'AI Interactions' },
  { value: 'vitals', label: 'Vitals' },
  { value: 'lab', label: 'Lab Results' },
  { value: 'visit', label: 'Visits' },
  { value: 'med', label: 'Medications' }
];

export default function Timeline() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medical Timeline</h1>
          <p className="text-gray-600 mt-1">Your complete medical history and activity</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            {EVENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {userId && (
        <TimelineViewer 
          patientId={userId} 
        />
      )}
    </div>
  );
}