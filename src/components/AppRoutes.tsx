// File: src/components/AppRoutes.tsx

import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';

// Route Modules
import { adminRoutes } from '@/routes/adminRoutes';
import { providerRoutes } from '@/routes/providerRoutes';
import { patientRoutes } from '@/routes/patientRoutes';
import { employerRoutes } from '@/routes/employerRoutes';
import { ownerRoutes } from '@/routes/ownerRoutes';

// Layout Wrapper
import LayoutWrapper from '@/components/layout/LayoutWrapper';

// Universal Pages
import LoginPortalSelector from '@/pages/LoginPortalSelector';
import ErrorPage from '@/pages/ErrorPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';

export default function AppRoutes() {
  console.log('[AppRoutes] Rendering routes');
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading...</div>}>
      <Routes>
        {/* Universal Entry Points */}
        <Route path="/" element={<LoginPortalSelector />} />
        <Route path="/login" element={<LoginPortalSelector />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Role-Based Routing */}
        {adminRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<LayoutWrapper>{element}</LayoutWrapper>} />
        ))}

        {providerRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<LayoutWrapper>{element}</LayoutWrapper>} />
        ))}

        {patientRoutes.map(({ path, element }) => {
          console.log('[AppRoutes] Mapping patient route:', path);
          return <Route key={path} path={path} element={<LayoutWrapper>{element}</LayoutWrapper>} />;
        })}

        {employerRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<LayoutWrapper>{element}</LayoutWrapper>} />
        ))}

        {ownerRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<LayoutWrapper>{element}</LayoutWrapper>} />
        ))}

        {/* Catch-all route - must be last */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
}
