import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function OwnerEmployeesPage() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from('employee_profiles').select('*');
      if (!error) setEmployees(data);
    };
    fetchEmployees();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">👩‍💼 Manage Employees</h1>
      <p className="text-gray-600">View active employees, invite more, and see enrollment status.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md">
            <h2 className="font-semibold">{emp.name}</h2>
            <p className="text-sm text-gray-500">{emp.email}</p>
            <p className="text-xs text-gray-400 mt-1">Status: {emp.status}</p>
            <button className="mt-2 text-green-600 text-sm underline">Manage</button>
          </div>
        ))}
      </div>
    </div>
  );
}