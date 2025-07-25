import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmployerDashboard() {
  const [employees, setEmployees] = useState([]);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: emp } = await supabase.from('employees').select('*');
      const { data: inv } = await supabase.from('employer_invoices').select('*').order('created_at', { descending: true }).limit(1).single();
      setEmployees(emp || []);
      setInvoice(inv);
    })();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🏢 Employer Dashboard</h1>

      <Card>
        <h2 className="text-xl font-semibold mb-2">📋 Active Employees</h2>
        <ul className="text-sm text-gray-700 list-disc pl-6 space-y-1">
          {employees.map(emp => (
            <li key={emp.id}>{emp.full_name} – {emp.status}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-2">💳 Most Recent Invoice</h2>
        {invoice ? (
          <div className="text-sm text-gray-700">
            <p>Total: ${invoice.total_amount}</p>
            <p>Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
            <Button variant="secondary" className="mt-2">Download PDF</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No invoice found.</p>
        )}
      </Card>
    </div>
  );
}