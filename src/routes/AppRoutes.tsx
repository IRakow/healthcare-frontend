// File: src/components/AppRoutes.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { adminRoutes } from '@/routes/adminRoutes';
import { employerRoutes } from '@/routes/employerRoutes';
import { ownerRoutes } from '@/routes/ownerroutes';
import { patientRoutes } from '@/routes/patientRoutes';

export default function AppRoutes() {
  return (
    <Routes>
      {adminRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {employerRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {ownerRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      {patientRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Routes>
  );
}