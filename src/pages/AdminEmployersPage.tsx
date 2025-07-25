import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState([]);

  useEffect(() => {
    const fetchEmployers = async () => {
      const { data, error } = await supabase.from('employers').select('*');
      if (!error) setEmployers(data);
    };
    fetchEmployers();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">👔 Employers</h1>
      <p className="text-gray-600">Manage all companies using your platform</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employers.map(emp => (
          <div key={emp.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all">
            <h2 className="font-semibold text-lg">{emp.name}</h2>
            <p className="text-sm text-gray-500">{emp.email}</p>
            <p className="text-xs text-gray-400 mt-1">Employees: {emp.employee_count}</p>
            <button className="mt-2 text-blue-600 text-sm underline">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}