// File: src/routes/adminRoutes.tsx

import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEmployersPage from '@/pages/AdminEmployersPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminBillingPage from '@/pages/AdminBillingPage';
import AuditLog from '@/pages/admin/AuditLog';
import Backup from '@/pages/admin/Backup';
import SuperPanel from '@/pages/admin/SuperPanelSimple';
import AILogsPage from '@/pages/admin/AILogsPage';
import AuditDashboard from '@/pages/admin/AuditDashboard';
import ComplianceDashboard from '@/pages/admin/ComplianceDashboard';
import CalendarView from '@/pages/CalendarView';
import { ChartLogsPage } from '@/pages/admin/ChartLogs';
import { ChartExportPage } from '@/pages/admin/ChartExport';
import { ChartDashboardPage } from '@/pages/admin/ChartDashboard';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminBroadcastPage from '@/pages/admin/AdminBroadcastPage';
import AdminBackupPage from '@/pages/admin/AdminBackupPage';
import AdminAuditLogPage from '@/pages/admin/AdminAuditLogPage';


export const adminRoutes = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/employers', element: <AdminEmployersPage /> },
  { path: '/admin/users', element: <AdminUsersPage /> },
  { path: '/admin/analytics', element: <AdminAnalyticsPage /> },
  { path: '/admin/settings', element: <AdminSettingsPage /> },
  { path: '/admin/billing', element: <AdminBillingPage /> },
  { path: '/admin/audit', element: <AuditLog /> },
  { path: '/admin/audit-log', element: <AdminAuditLogPage /> },
  { path: '/admin/backup', element: <Backup /> },
  { path: '/admin/backups', element: <AdminBackupPage /> },
  { path: '/admin/broadcast', element: <AdminBroadcastPage /> },
  { path: '/admin/superpanel', element: <SuperPanel /> },
  { path: '/admin/ai-logs', element: <AILogsPage /> },
  { path: '/admin/audit-dashboard', element: <AuditDashboard /> },
  { path: '/admin/compliance', element: <ComplianceDashboard /> },
  { path: '/admin/calendar', element: <CalendarView /> },
  { path: '/admin/chart-logs', element: <ChartLogsPage /> },
  { path: '/admin/chart-export', element: <ChartExportPage /> },
  { path: '/admin/chart-dashboard', element: <ChartDashboardPage /> }
];
