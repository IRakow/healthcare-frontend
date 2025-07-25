import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Mail, 
  DollarSign,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  employer_id: string;
  month: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  pdf_url?: string;
  sent_at?: string;
  paid_at?: string;
  created_at: string;
  employer?: {
    name: string;
    logo_url?: string;
  };
}

export default function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Using the exact query pattern provided
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .order('month', { ascending: false });

      if (invoices) {
        // Fetch employer details for each invoice
        const invoicesWithEmployers = await Promise.all(
          invoices.map(async (invoice) => {
            const { data: employer } = await supabase
              .from('employers')
              .select('name, logo_url')
              .eq('id', invoice.employer_id)
              .single();
            
            return { ...invoice, employer };
          })
        );
        
        setInvoices(invoicesWithEmployers);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'overdue':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): any => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'primary';
      case 'overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, '_blank');
    } else {
      // Generate PDF if not exists
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/generate-invoice-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invoiceId: invoice.id }),
        });
        
        if (response.ok) {
          const { pdfUrl } = await response.json();
          window.open(pdfUrl, '_blank');
        }
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/send-invoice-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      
      // Refresh invoices to update status
      fetchInvoices();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <div className="flex gap-4 items-center">
          <div className="text-sm text-gray-600">
            Total: ${(totalAmount / 100).toFixed(2)}
          </div>
          <Button variant="primary">
            Generate Monthly Invoices
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="ml-2">
                ({invoices.filter(inv => inv.status === status).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold">{invoice.employer?.name || 'Unknown'}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(invoice.month + '-01'), 'MMMM yyyy')}
                </div>
              </div>
              <Badge variant={getStatusColor(invoice.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(invoice.status)}
                  {invoice.status}
                </span>
              </Badge>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <DollarSign className="w-5 h-5" />
                {(invoice.total_amount / 100).toFixed(2)}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadPDF(invoice)}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              
              {invoice.status === 'draft' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSendEmail(invoice)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Send
                </Button>
              )}
              
              <Button size="sm" variant="outline">
                <FileText className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>

            {invoice.sent_at && (
              <p className="text-xs text-gray-500 mt-3">
                Sent: {format(new Date(invoice.sent_at), 'MMM dd, yyyy')}
              </p>
            )}
            {invoice.paid_at && (
              <p className="text-xs text-green-600 mt-1">
                Paid: {format(new Date(invoice.paid_at), 'MMM dd, yyyy')}
              </p>
            )}
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No invoices found</p>
        </Card>
      )}
    </div>
  );
}