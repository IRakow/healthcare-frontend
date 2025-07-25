import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function OwnerInvoicesPage() {
  const [myInvoices, setMyInvoices] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('invoices').select('*').eq('employer_id', 'demo-id');
      if (!error) setMyInvoices(data);
    };
    fetch();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">🧾 My Invoices</h1>
      <p className="text-gray-600">Download billing statements and track payment history for your organization.</p>
      <div className="overflow-auto bg-white shadow rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Invoice</th>
              <th>Amount</th>
              <th>Status</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {myInvoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td>#{inv.id.slice(0, 6).toUpperCase()}</td>
                <td>${inv.amount.toFixed(2)}</td>
                <td>{inv.status}</td>
                <td><a href={inv.pdf_url} target="_blank" className="text-blue-500 hover:underline">Download</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}