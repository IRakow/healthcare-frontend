import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Activity,
  Shield,
  AlertTriangle,
  FileText,
  Eye,
  Edit,
  Trash,
  Mail,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  context: any;
  created_at: string;
}

export default function AuditLogViewer() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, actionFilter, dateFilter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);

      // Using the exact query pattern provided
      const { data: audit } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (audit) {
        setAuditLogs(audit);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...auditLogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.context).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => {
        const action = log.action.toLowerCase();
        switch (actionFilter) {
          case 'auth':
            return action.includes('login') || action.includes('logout') || action.includes('auth');
          case 'data':
            return action.includes('create') || action.includes('update') || action.includes('delete');
          case 'invoice':
            return action.includes('invoice');
          case 'security':
            return action.includes('permission') || action.includes('failed');
          default:
            return true;
        }
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => 
        new Date(log.created_at) >= filterDate
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login') || actionLower.includes('logout')) return <User className="w-4 h-4" />;
    if (actionLower.includes('view') || actionLower.includes('read')) return <Eye className="w-4 h-4" />;
    if (actionLower.includes('create') || actionLower.includes('insert')) return <FileText className="w-4 h-4" />;
    if (actionLower.includes('update') || actionLower.includes('edit')) return <Edit className="w-4 h-4" />;
    if (actionLower.includes('delete')) return <Trash className="w-4 h-4" />;
    if (actionLower.includes('invoice')) return <DollarSign className="w-4 h-4" />;
    if (actionLower.includes('email') || actionLower.includes('sent')) return <Mail className="w-4 h-4" />;
    if (actionLower.includes('permission') || actionLower.includes('denied')) return <Shield className="w-4 h-4" />;
    if (actionLower.includes('error') || actionLower.includes('failed')) return <AlertTriangle className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('delete')) return 'destructive';
    if (actionLower.includes('create') || actionLower.includes('insert')) return 'success';
    if (actionLower.includes('update')) return 'warning';
    if (actionLower.includes('error') || actionLower.includes('failed')) return 'destructive';
    if (actionLower.includes('permission')) return 'secondary';
    return 'default';
  };

  const exportLogs = async () => {
    try {
      const { data: allLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (allLogs) {
        const csv = [
          ['ID', 'Created At', 'User ID', 'Action', 'Context'],
          ...allLogs.map(log => [
            log.id,
            log.created_at,
            log.user_id || 'System',
            log.action,
            JSON.stringify(log.context)
          ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

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
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <Button onClick={exportLogs} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
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
            value={actionFilter}
            onValueChange={setActionFilter}
          >
            <option value="all">All Actions</option>
            <option value="auth">Authentication</option>
            <option value="data">Data Changes</option>
            <option value="invoice">Invoices</option>
            <option value="security">Security</option>
          </Select>

          <Select
            value={dateFilter}
            onValueChange={setDateFilter}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </Select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            {filteredLogs.length} of {auditLogs.length} logs
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <Card key={log.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                  </div>
                  
                  {log.user_id && (
                    <p className="text-sm text-gray-600 mb-2">
                      User ID: {log.user_id}
                    </p>
                  )}
                  
                  {log.context && Object.keys(log.context).length > 0 && (
                    <details className="cursor-pointer">
                      <summary className="text-sm text-blue-600 hover:text-blue-800">
                        View Context Details
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-40">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <Card className="p-4">
          <div className="flex justify-between items-center">
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
        </Card>
      )}

      {filteredLogs.length === 0 && (
        <Card className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No audit logs found</p>
        </Card>
      )}
    </div>
  );
}