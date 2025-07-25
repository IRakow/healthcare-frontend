import PatientDashboard from '@/pages/patient/Dashboard';
import PatientRecords from '@/pages/patient/Records';
import Meditation from '@/pages/patient/Meditation';
import NutritionLog from '@/pages/patient/NutritionLog';
import AppointmentsPage from '@/pages/patient/AppointmentsPage';
import Labs from '@/pages/patient/Labs';
import Wearables from '@/pages/patient/Wearables';
import PatientSettings from '@/pages/patient/Settings';
import Intake from '@/pages/patient/Intake';
import Medications from '@/pages/patient/Medications';
import Family from '@/pages/patient/Family';
import Timeline from '@/pages/patient/Timeline';
import Documents from '@/pages/patient/Documents';
import CalendarView from '@/pages/CalendarView';
import TelemedVisit from '@/pages/patient/TelemedVisit';
import ShareAccess from '@/pages/patient/ShareAccess';
import SharedPatientView from '@/pages/patient/SharedPatientView';
import ExportPDF from '@/pages/patient/ExportPDF';

export const patientRoutes = [
  { path: '/patient', element: <PatientDashboard /> },
  { path: '/patient/records', element: <PatientRecords /> },
  { path: '/patient/meditation', element: <Meditation /> },
  { path: '/patient/nutrition', element: <NutritionLog /> },
  { path: '/patient/appointments', element: <AppointmentsPage /> },
  { path: '/patient/labs', element: <Labs /> },
  { path: '/patient/wearables', element: <Wearables /> },
  { path: '/patient/settings', element: <PatientSettings /> },
  { path: '/patient/intake', element: <Intake /> },
  { path: '/patient/medications', element: <Medications /> },
  { path: '/patient/family', element: <Family /> },
  { path: '/patient/timeline', element: <Timeline /> },
  { path: '/patient/documents', element: <Documents /> },
  { path: '/patient/calendar', element: <CalendarView /> },
  { path: '/patient/telemed/:appointmentId', element: <TelemedVisit /> },
  { path: '/patient/share-access', element: <ShareAccess /> },
  { path: '/patient/shared/:patientId', element: <SharedPatientView /> },
  { path: '/patient/export-pdf', element: <ExportPDF /> },
];