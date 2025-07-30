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
import SimpleLanding from '@/pages/SimpleLanding';
import ErrorPage from '@/pages/ErrorPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

export default function AppRoutes() {
  console.log('[AppRoutes] Rendering routes');
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading...</div>}>
      <Routes>
        {/* Universal Entry Points */}
        <Route path="/" element={<SimpleLanding />} />
        <Route path="/login" element={<SimpleLanding />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Role-Based Routing */}
        {adminRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {providerRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {patientRoutes.map(({ path, element }) => {
          console.log('[AppRoutes] Mapping patient route:', path);
          return <Route key={path} path={path} element={element} />;
        })}

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
