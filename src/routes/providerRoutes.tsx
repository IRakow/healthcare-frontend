// File: src/routes/providerRoutes.tsx

import ProviderDashboardSimple from '@/pages/provider/ProviderDashboardSimple';
import VisitSchedulePage from '@/pages/provider/visits';
import PatientDirectoryPage from '@/pages/provider/patients';
import SOAPNotesPage from '@/pages/provider/soap';
import LabReviewPage from '@/pages/provider/LabReview';
import TelemedPage from '@/pages/provider/video';
import ProviderMessagesPage from '@/pages/provider/messages/inbox';
import VisitReviewQueue from '@/pages/provider/VisitReviewQueue';
import PatientOverview from '@/pages/provider/PatientOverview';

export const providerRoutes = [
  { path: '/provider', element: <ProviderDashboardSimple /> },
  { path: '/provider/dashboard', element: <ProviderDashboardSimple /> },
  { path: '/provider/visits', element: <VisitSchedulePage /> },
  { path: '/provider/patients', element: <PatientDirectoryPage /> },
  { path: '/provider/soap', element: <SOAPNotesPage /> },
  { path: '/provider/labs', element: <LabReviewPage /> },
  { path: '/provider/video', element: <TelemedPage /> },
  { path: '/provider/messages/inbox', element: <ProviderMessagesPage /> },
  { path: '/provider/review-queue', element: <VisitReviewQueue /> },
  { path: '/provider/patient/:id', element: <PatientOverview /> }
];
