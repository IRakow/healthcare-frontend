import { Routes, Route } from 'react-router-dom';
import SimpleHomePage from '@/pages/SimpleHomePage';
import { adminRoutes } from '@/routes/adminRoutes';
import { ownerRoutes } from '@/routes/ownerRoutes';
import { patientRoutes } from '@/routes/patientRoutes';
import { providerRoutes } from '@/routes/providerRoutes';
import { employerRoutes } from '@/routes/employerRoutes';
import PatientLogin from '@/pages/PatientLogin';
import TelemedRedirect from '@/pages/TelemedRedirect';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<SimpleHomePage />} />
      
      {/* Telemed redirect - detects user role and redirects appropriately */}
      <Route path="/telemed/:appointmentId" element={<TelemedRedirect />} />
      
      {/* Admin routes */}
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Owner routes */}
      {ownerRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Patient routes */}
      <Route path="/patient/login" element={<PatientLogin />} />
      {patientRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Provider routes */}
      {providerRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Employer routes */}
      {employerRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
}