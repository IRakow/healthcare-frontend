import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SimpleHomePage from './pages/SimpleHomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminEmployersPage from './pages/AdminEmployersPage'
import AdminSettingsPage from './pages/AdminSettingsPage'
import AdminBillingPage from './pages/AdminBillingPage'
import AuditLog from './pages/admin/AuditLog'
import Backup from './pages/admin/Backup'
import OwnerLogin from './pages/OwnerLogin'
import OwnerDashboard from './pages/OwnerDashboard'
import OwnerEmployeesPage from './pages/OwnerEmployeesPage'
import OwnerAnalyticsPage from './pages/OwnerAnalyticsPage'
import OwnerBrandingPage from './pages/OwnerBrandingPage'
import OwnerInvoicesPage from './pages/OwnerInvoicesPage'
import PatientLogin from './pages/PatientLogin'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SimpleHomePage />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employers" element={<AdminEmployersPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/billing" element={<AdminBillingPage />} />
        <Route path="/admin/audit" element={<AuditLog />} />
        <Route path="/admin/backup" element={<Backup />} />
        
        {/* Owner routes */}
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/employees" element={<OwnerEmployeesPage />} />
        <Route path="/owner/analytics" element={<OwnerAnalyticsPage />} />
        <Route path="/owner/branding" element={<OwnerBrandingPage />} />
        <Route path="/owner/invoices" element={<OwnerInvoicesPage />} />
        
        {/* Patient routes */}
        <Route path="/patient/login" element={<PatientLogin />} />
      </Routes>
    </Router>
  )
}