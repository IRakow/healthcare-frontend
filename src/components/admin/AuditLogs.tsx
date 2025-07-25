import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  context: any;
  user_email: string;
  user_name: string;
  table_name: string;
  operation: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterTable, setFilterTable] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchAuditLogs();
  }, [page, searchTerm, filterAction, filterTable]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_log_summary')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%,user_name.ilike.%${searchTerm}%`);
      }

      if (filterAction !== 'all') {
        query = query.ilike('action', `%${filterAction}%`);
      }

      if (filterTable !== 'all') {
        query = query.eq('table_name', filterTable);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .csv();

      if (error) throw error;

      // Create CSV download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('INSERT')) return 'success';
    if (action.includes('UPDATE')) return 'warning';
    if (action.includes('DELETE')) return 'destructive';
    return 'default';
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'INSERT': return <FileText className="w-4 h-4" />;
      case 'UPDATE': return <Activity className="w-4 h-4" />;
      case 'DELETE': return <Activity className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-gray-600">Track all system activities and changes</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterAction}
            onValueChange={setFilterAction}
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="invoice">Invoice</option>
            <option value="employer">Employer</option>
            <option value="system">System</option>
          </Select>

          <Select
            value={filterTable}
            onValueChange={setFilterTable}
          >
            <option value="all">All Tables</option>
            <option value="employers">Employers</option>
            <option value="invoices">Invoices</option>
            <option value="members">Members</option>
            <option value="auth">Authentication</option>
          </Select>

          <Button
            onClick={exportLogs}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4">Time</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Action</th>
                <th className="text-left p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {format(new Date(log.created_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.created_at), 'HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {log.user_name || 'System'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.user_email || 'Automated'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getOperationIcon(log.operation)}
                        <Badge variant={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <details className="cursor-pointer">
                        <summary className="text-sm text-blue-600 hover:text-blue-800">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= totalCount}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}