import { lazy } from 'react';

const EmployerDashboard = lazy(() => import('@/pages/employer/Dashboard'));
const EmployerInvoices = lazy(() => import('@/pages/employer/Invoices'));
const EmployerSettings = lazy(() => import('@/pages/employer/Settings'));

export const employerRoutes = [
  {
    path: '/employer',
    element: <EmployerDashboard />
  },
  {
    path: '/employer/invoices',
    element: <EmployerInvoices />
  },
  {
    path: '/employer/settings',
    element: <EmployerSettings />
  }
];