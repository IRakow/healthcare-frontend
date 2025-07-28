import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface InvoiceEntry {
  id: string;
  employer_name: string;
  month: string;
  total_due: number;
  paid: boolean;
}

export const EmployerInvoiceSummary: React.FC = () => {
  const supabase = useSupabaseClient();
  const [invoices, setInvoices] = useState<InvoiceEntry[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from('employer_invoices')
        .select('id, employer_name, month, total_due, paid')
        .order('month', { ascending: false });

      if (error) {
        console.error('[EmployerInvoiceSummary] Supabase error:', error);
        return;
      }

      setInvoices(data);
    };

    fetchInvoices();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Employer Invoice Summary</h2>
      {invoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invoices found.</p>
      ) : (
        <ul className="space-y-4">
          {invoices.map((inv) => (
            <li key={inv.id} className="p-4 bg-white rounded-xl shadow border flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">{inv.employer_name}</p>
                <p className="text-xs text-muted-foreground">Month: {inv.month}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">${inv.total_due.toFixed(2)}</p>
                <p className={`text-xs ${inv.paid ? 'text-green-600' : 'text-red-600'}`}>{inv.paid ? 'Paid' : 'Unpaid'}</p>
              </div>
              <FileText className="w-5 h-5 text-gray-500" />
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};