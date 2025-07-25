import OwnerDashboard from '@/pages/owner/OwnerDashboard';
import OwnerInvoices from '@/pages/owner/Invoices';
import EmployersPage from '@/pages/owner/Employers';
import ReportsPage from '@/pages/owner/Reports';
import PayoutsPage from '@/pages/owner/Payouts';
import EmployerInvoicesPage from '@/pages/owner/EmployerInvoices';
import EmployerBranding from '@/pages/owner/EmployerBranding';
import VoiceSelector from '@/pages/owner/VoiceSelector';
import BillingStatement from '@/pages/owner/BillingStatement';
import InvoiceAdmin from '@/pages/owner/InvoiceAdmin';
import SpendingTrends from '@/pages/owner/SpendingTrends';
import AssistantConfig from '@/pages/owner/AssistantConfig';
import InvoiceCalendar from '@/pages/owner/InvoiceCalendar';
import AppointmentCharges from '@/pages/owner/AppointmentCharges';
import AuditLogs from '@/components/admin/AuditLogs';
import InvoiceDashboard from '@/pages/owner/InvoiceDashboard';

export const ownerRoutes = [
  { path: '/owner', element: <OwnerDashboard /> },
  { path: '/owner/invoices', element: <OwnerInvoices /> },
  { path: '/owner/employers', element: <EmployersPage /> },
  { path: '/owner/reports', element: <ReportsPage /> },
  { path: '/owner/payouts', element: <PayoutsPage /> },
  { path: '/owner/employer-invoices', element: <EmployerInvoicesPage /> },
  { path: '/owner/branding', element: <EmployerBranding /> },
  { path: '/owner/voice-selector', element: <VoiceSelector /> },
  { path: '/owner/billing-statement', element: <BillingStatement /> },
  { path: '/owner/invoice-admin', element: <InvoiceAdmin /> },
  { path: '/owner/spending-trends', element: <SpendingTrends /> },
  { path: '/owner/assistant-config', element: <AssistantConfig /> },
  { path: '/owner/calendar', element: <InvoiceCalendar /> },
  { path: '/owner/appointment-charges', element: <AppointmentCharges /> },
  { path: '/owner/audit-logs', element: <AuditLogs /> },
  { path: '/owner/invoice-dashboard', element: <InvoiceDashboard /> },
];