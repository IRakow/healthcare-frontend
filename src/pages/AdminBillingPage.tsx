import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase.from('invoices').select('*');
      if (!error) setInvoices(data);
    };
    fetchInvoices();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">💳 Admin Billing Center</h1>
        <p className="text-gray-600">Monitor all billing activity across tenants. Generate monthly statements, track overdue payments, and push adjustments.</p>
        <div className="bg-white p-4 shadow rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Employer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td>{inv.employer_name}</td>
                <td>${inv.amount.toFixed(2)}</td>
                <td>{inv.status}</td>
                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </AdminLayout>
  );
}