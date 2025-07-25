// src/routes/adminRoutes.tsx
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminEmployersPage from '@/pages/AdminEmployersPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminBillingPage from '@/pages/AdminBillingPage';
import AuditLog from '@/pages/admin/AuditLog';
import Backup from '@/pages/admin/Backup';
import SuperPanel from '@/pages/admin/SuperPanelSimple';
import AILogsPage from '@/pages/admin/AILogsPage';
import AuditDashboard from '@/pages/admin/AuditDashboard';
import CalendarView from '@/pages/CalendarView';

export const adminRoutes = [
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/employers', element: <AdminEmployersPage /> },
  { path: '/admin/settings', element: <AdminSettingsPage /> },
  { path: '/admin/billing', element: <AdminBillingPage /> },
  { path: '/admin/audit', element: <AuditLog /> },
  { path: '/admin/backup', element: <Backup /> },
  { path: '/admin/superpanel', element: <SuperPanel /> },
  { path: '/admin/ai-logs', element: <AILogsPage /> },
  { path: '/admin/audit-dashboard', element: <AuditDashboard /> },
  { path: '/admin/calendar', element: <CalendarView /> },
];