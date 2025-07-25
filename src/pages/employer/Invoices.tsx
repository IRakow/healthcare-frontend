import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, DollarSign } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';

interface Invoice {
  id: string;
  employer_id: string;
  month: string;
  total_amount: number;
  patient_count: number;
  status: string;
  created_at: string;
  pdf_url?: string;
}

export default function EmployerInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const branding = useBranding();
  const accentColor = branding?.primary_color || '#3B82F6';

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get employer ID for the current user
      const { data: userData } = await supabase
        .from('users')
        .select('employer_id')
        .eq('id', user.id)
        .single();

      if (userData?.employer_id) {
        // Fetch invoices for this employer
        const { data } = await supabase
          .from('invoices')
          .select('*')
          .eq('employer_id', userData.employer_id)
          .order('month', { ascending: false });

        setInvoices(data || []);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generatePDF(invoiceId: string) {
    setGenerating(invoiceId);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log the PDF generation request
      if (user) {
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'invoice_pdf_generate',
          target: invoiceId
        });
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-invoice-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          invoiceId 
        })
      });

      const data = await response.json();
      if (data.pdf_url) {
        window.open(data.pdf_url, '_blank');
        // Update local state with PDF URL
        setInvoices(invoices.map(inv => 
          inv.id === invoiceId ? { ...inv, pdf_url: data.pdf_url } : inv
        ));
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setGenerating(null);
    }
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center py-12">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="text-sm text-gray-600">
          Total: {invoices.length} invoices
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No invoices yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <div 
              key={invoice.id}
              style={{ borderColor: accentColor }}
              className="rounded-lg border p-6 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold">
                      {formatMonth(invoice.month)}
                    </h3>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-semibold">${invoice.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Patients:</span>
                      <span className="font-semibold">{invoice.patient_count}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Created: {new Date(invoice.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  {invoice.pdf_url ? (
                    <a 
                      href={invoice.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </a>
                  ) : (
                    <Button
                      onClick={() => generatePDF(invoice.id)}
                      disabled={generating === invoice.id}
                      variant="secondary"
                    >
                      {generating === invoice.id ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate PDF
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={async () => {
                      // Log the view action
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from('audit_logs').insert({
                          user_id: user.id,
                          action: 'invoice_pdf_download',
                          target: invoice.id
                        });
                      }
                      // Open PDF in new tab
                      window.open(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoice-pdf/${invoice.id}`,
                        '_blank'
                      );
                    }}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View PDF
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}