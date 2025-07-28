import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { adminRoutes } from '@/routes/adminRoutes';
import { employerRoutes } from '@/routes/employerRoutes';
import { ownerRoutes } from '@/routes/ownerroutes';
import { patientRoutes } from '@/routes/patientRoutes';
import Login from '@/pages/Login'; // 👈 ADD THIS

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} /> {/* 👈 ADD THIS FIRST */}

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
