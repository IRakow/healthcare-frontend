// File: src/components/AppRoutes.tsx

import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';

// Route Modules
import { adminRoutes } from '@/routes/adminRoutes';
import { providerRoutes } from '@/routes/providerRoutes';
import { patientRoutes } from '@/routes/patientRoutes';
import { employerRoutes } from '@/routes/employerRoutes';
import { ownerRoutes } from '@/routes/ownerRoutes';

// Universal Pages
import LoginPortalSelector from '@/pages/LoginPortalSelector';
import ErrorPage from '@/pages/ErrorPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import PatientLogin from '@/pages/PatientLogin';

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading...</div>}>
      <Routes>
        {/* Universal Entry Points */}
        <Route path="/" element={<LoginPortalSelector />} />
        <Route path="/login" element={<LoginPortalSelector />} />
        <Route path="/login/patient" element={<PatientLogin />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Role-Based Routing */}
        {adminRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {providerRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {patientRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {employerRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {ownerRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* Catch-all route - must be last */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}
