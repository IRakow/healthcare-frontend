// File: src/routes/providerRoutes.tsx

import ProviderDashboard from '@/pages/provider/index';
import VisitSchedulePage from '@/pages/provider/visits';
import PatientDirectoryPage from '@/pages/provider/patients';
import SOAPNotesPage from '@/pages/provider/soap';
import LabReviewPage from '@/pages/provider/LabReview';
import TelemedPage from '@/pages/provider/video';
import ProviderMessagesPage from '@/pages/provider/messages/inbox';
import VisitReviewQueue from '@/pages/provider/VisitReviewQueue';
import PatientOverview from '@/pages/provider/PatientOverview';

export const providerRoutes = [
  { path: '/provider', element: <ProviderDashboard /> },
  { path: '/provider/dashboard', element: <ProviderDashboard /> },
  { path: '/provider/visits', element: <VisitSchedulePage /> },
  { path: '/provider/patients', element: <PatientDirectoryPage /> },
  { path: '/provider/soap', element: <SOAPNotesPage /> },
  { path: '/provider/labs', element: <LabReviewPage /> },
  { path: '/provider/video', element: <TelemedPage /> },
  { path: '/provider/messages/inbox', element: <ProviderMessagesPage /> },
  { path: '/provider/review-queue', element: <VisitReviewQueue /> },
  { path: '/provider/patient/:id', element: <PatientOverview /> }
];
