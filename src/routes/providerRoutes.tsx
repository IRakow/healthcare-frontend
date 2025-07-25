import { lazy } from 'react';

const ProviderDashboard = lazy(() => import('@/pages/provider/ProviderDashboard'));
const PatientFile = lazy(() => import('@/pages/provider/PatientFile'));
const CalendarView = lazy(() => import('@/pages/CalendarView'));
const ProviderTelemedVisit = lazy(() => import('@/pages/provider/TelemedVisit'));
const ProviderAnalytics = lazy(() => import('@/pages/provider/ProviderAnalytics'));
const VisitReviewQueue = lazy(() => import('@/pages/provider/VisitReviewQueue'));
const ProviderNotifications = lazy(() => import('@/pages/provider/ProviderNotifications'));
const SOAPNotes = lazy(() => import('@/pages/provider/SOAPNotes'));
const LabReview = lazy(() => import('@/pages/provider/LabReview'));
const ProviderMessages = lazy(() => import('@/pages/provider/ProviderMessages'));

export const providerRoutes = [
  {
    path: '/provider',
    element: <ProviderDashboard />
  },
  {
    path: '/provider/patient/:patientId',
    element: <PatientFile />
  },
  {
    path: '/provider/calendar',
    element: <CalendarView />
  },
  {
    path: '/provider/telemed/:appointmentId',
    element: <ProviderTelemedVisit />
  },
  {
    path: '/provider/analytics',
    element: <ProviderAnalytics />
  },
  {
    path: '/provider/review',
    element: <VisitReviewQueue />
  },
  {
    path: '/provider/notifications',
    element: <ProviderNotifications />
  },
  {
    path: '/provider/soap-notes',
    element: <SOAPNotes />
  },
  {
    path: '/provider/lab-review',
    element: <LabReview />
  },
  {
    path: '/provider/messages',
    element: <ProviderMessages />
  }
];