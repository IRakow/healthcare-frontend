import PatientDashboardSimpleHybrid from '@/pages/patient/PatientDashboardSimpleHybrid';
import PatientRecords from '@/pages/patient/Records';
import Meditation from '@/pages/patient/Meditation';
import NutritionLog from '@/pages/patient/NutritionLog';
import NutritionDashboard from '@/pages/patient/NutritionDashboard';
import AppointmentsPage from '@/pages/patient/appointments';
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
import HealthDashboard from '@/pages/patient/HealthDashboard';
import VoiceScreen from '@/pages/patient/VoiceScreen';
import VideoAssessment from '@/pages/patient/VideoAssessment';
import WeeklyPlanner from '@/pages/patient/WeeklyPlanner';
import MealQualityFeedback from '@/pages/patient/MealQualityFeedback';
import LifestyleStreaks from '@/pages/patient/LifestyleStreaks';
import Meditate from '@/pages/patient/Meditate';
import Goals from '@/pages/patient/Goals';
import Grocery from '@/pages/patient/Grocery';
import Notifications from '@/pages/patient/Notifications';
import Allergies from '@/pages/patient/Allergies';
import AIHistory from '@/pages/patient/AIHistory';
import MealPlan from '@/pages/patient/MealPlan';
import UnifiedGlassDashboard from '@/pages/patient/UnifiedGlassDashboard';
import Scan from '@/pages/patient/Scan';
import FoodIntel from '@/pages/patient/FoodIntel';
import ProgressPhotos from '@/pages/patient/ProgressPhotos';
import PatientCalendar from '@/pages/patient/PatientCalendar';
import { AISummaryPanel } from '@/components/patient/AISummaryPanel';

export const patientRoutes = [
  { path: '/patient', element: <PatientDashboardSimpleHybrid /> },
  { path: '/patient/dashboard', element: <PatientDashboardSimpleHybrid /> },
  { path: '/patient/records', element: <PatientRecords /> },
  { path: '/patient/health-dashboard', element: <HealthDashboard /> },
  { path: '/patient/voice-screen', element: <VoiceScreen /> },
  { path: '/patient/video-assessment', element: <VideoAssessment /> },
  { path: '/patient/weekly-planner', element: <WeeklyPlanner /> },
  { path: '/patient/meal-feedback', element: <MealQualityFeedback /> },
  { path: '/patient/lifestyle-streaks', element: <LifestyleStreaks /> },
  { path: '/patient/meditation', element: <Meditation /> },
  { path: '/patient/nutrition', element: <NutritionDashboard /> },
  { path: '/patient/nutrition-log', element: <NutritionLog /> },
  { path: '/patient/appointments', element: <AppointmentsPage /> },
  { path: '/patient/labs', element: <Labs /> },
  { path: '/patient/wearables', element: <Wearables /> },
  { path: '/patient/settings', element: <PatientSettings /> },
  { path: '/patient/intake', element: <Intake /> },
  { path: '/patient/medications', element: <Medications /> },
  { path: '/patient/family', element: <Family /> },
  { path: '/patient/timeline', element: <Timeline /> },
  { path: '/patient/documents', element: <Documents /> },
  { path: '/patient/calendar', element: <PatientCalendar /> },
  { path: '/patient/telemed/:appointmentId', element: <TelemedVisit /> },
  { path: '/patient/visit', element: <TelemedVisit /> },
  { path: '/patient/share-access', element: <ShareAccess /> },
  { path: '/patient/shared/:patientId', element: <SharedPatientView /> },
  { path: '/patient/export-pdf', element: <ExportPDF /> },
  { path: '/patient/meditate', element: <Meditate /> },
  { path: '/patient/goals', element: <Goals /> },
  { path: '/patient/grocery', element: <Grocery /> },
  { path: '/patient/notifications', element: <Notifications /> },
  { path: '/patient/allergies', element: <Allergies /> },
  { path: '/patient/ai-history', element: <AIHistory /> },
  { path: '/patient/meal-plan', element: <MealPlan /> },
  { path: '/patient/unified-dashboard', element: <UnifiedGlassDashboard /> },
  { path: '/patient/scan', element: <Scan /> },
  { path: '/patient/food-intel', element: <FoodIntel /> },
  { path: '/patient/progress', element: <ProgressPhotos /> },
  { path: '/patient/ai-summary', element: <AISummaryPanel /> }
];
