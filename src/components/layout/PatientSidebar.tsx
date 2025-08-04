// src/components/layout/PatientSidebar.tsx

import { NavLink } from 'react-router-dom';

export default function PatientSidebar() {
  return (
    <div className="w-full space-y-4 p-4 bg-white/80 backdrop-blur shadow-md">
      <NavLink to="/patient/dashboard" className="block font-semibold">
        🏠 Dashboard
      </NavLink>
      <NavLink to="/patient/appointments" className="block font-semibold">
        📅 Appointments
      </NavLink>
      <NavLink to="/patient/trends" className="block font-semibold">
        📈 Trends
      </NavLink>
      <NavLink to="/patient/timeline" className="block font-semibold">
        📜 Timeline
      </NavLink>
      <NavLink to="/patient/fridge-scanner" className="block font-semibold">
        🧊 Fridge Scanner
      </NavLink>
      <NavLink to="/patient/meal-planner" className="block font-semibold">
        🧠 Meal Planner
      </NavLink>
      <NavLink to="/patient/shop" className="block font-semibold">
        🛒 Smart Shop
      </NavLink>
      <NavLink to="/patient/medications" className="block font-semibold">
        💊 Medications
      </NavLink>
      <NavLink to="/patient/uploads" className="block font-semibold">
        📁 Uploads
      </NavLink>
      <NavLink to="/patient/messages" className="block font-semibold">
        💬 Messages
      </NavLink>
      <NavLink to="/patient/settings" className="block font-semibold">
        ⚙️ Settings
      </NavLink>
    </div>
  );
}