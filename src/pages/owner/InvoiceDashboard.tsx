import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import InvoicesList from '@/components/invoices/InvoicesList';
import { Card } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceStats {
  totalRevenue: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averagePaymentTime: number;
  monthlyGrowth: number;
}

export default function InvoiceDashboard() {
  const [stats, setStats] = useState<InvoiceStats>({
    totalRevenue: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    averagePaymentTime: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceStats();
  }, []);

  const fetchInvoiceStats = async () => {
    try {
      // Fetch all invoices using the provided pattern
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .order('month', { ascending: false });

      if (invoices) {
        // Calculate statistics
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
        const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
        const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
        const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

        // Calculate average payment time for paid invoices
        const paidWithDates = invoices.filter(inv => inv.status === 'paid' && inv.sent_at && inv.paid_at);
        const totalPaymentDays = paidWithDates.reduce((sum, inv) => {
          const sentDate = new Date(inv.sent_at!);
          const paidDate = new Date(inv.paid_at!);
          const days = Math.floor((paidDate.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        const averagePaymentTime = paidWithDates.length > 0 ? Math.round(totalPaymentDays / paidWithDates.length) : 0;

        // Calculate monthly growth
        const currentMonth = format(new Date(), 'yyyy-MM');
        const lastMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM');
        
        const currentMonthRevenue = invoices
          .filter(inv => inv.month === currentMonth)
          .reduce((sum, inv) => sum + inv.total_amount, 0);
        
        const lastMonthRevenue = invoices
          .filter(inv => inv.month === lastMonth)
          .reduce((sum, inv) => sum + inv.total_amount, 0);
        
        const monthlyGrowth = lastMonthRevenue > 0 
          ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

        setStats({
          totalRevenue,
          paidInvoices,
          pendingInvoices,
          overdueInvoices,
          averagePaymentTime,
          monthlyGrowth
        });
      }
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Invoice Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${(stats.totalRevenue / 100).toFixed(2)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.monthlyGrowth.toFixed(1)}% from last month
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Invoices</p>
              <p className="text-2xl font-bold">{stats.paidInvoices}</p>
              <p className="text-sm text-gray-500">Avg payment: {stats.averagePaymentTime} days</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
              <p className="text-sm text-orange-600">{stats.overdueInvoices} overdue</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
            <FileText className="w-4 h-4" />
            Generate Monthly Invoices
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Calendar className="w-4 h-4" />
            Schedule Recurring
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <DollarSign className="w-4 h-4" />
            Payment Settings
          </button>
        </div>
      </Card>

      {/* Invoices List */}
      <InvoicesList />
    </div>
  );
}