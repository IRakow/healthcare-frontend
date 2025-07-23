import { withAuth } from './withAuth';

// Import your page components
import AdminDashboard from '@/pages/AdminDashboard';
import AdminEmployersPage from '@/pages/AdminEmployersPage';
import AdminSettingsPage from '@/pages/AdminSettingsPage';
import AdminBillingPage from '@/pages/AdminBillingPage';
import AdminBackup from '@/pages/admin/Backup';

import OwnerDashboard from '@/pages/OwnerDashboard';
import OwnerEmployeesPage from '@/pages/OwnerEmployeesPage';
import OwnerAnalyticsPage from '@/pages/OwnerAnalyticsPage';
import OwnerBrandingPage from '@/pages/OwnerBrandingPage';

// Create protected versions of components
export const ProtectedAdminDashboard = withAuth(AdminDashboard, ['admin']);
export const ProtectedAdminEmployers = withAuth(AdminEmployersPage, ['admin']);
export const ProtectedAdminSettings = withAuth(AdminSettingsPage, ['admin']);
export const ProtectedAdminBilling = withAuth(AdminBillingPage, ['admin']);
export const ProtectedAdminBackup = withAuth(AdminBackup, ['admin']);

export const ProtectedOwnerDashboard = withAuth(OwnerDashboard, ['owner']);
export const ProtectedOwnerEmployees = withAuth(OwnerEmployeesPage, ['owner']);
export const ProtectedOwnerAnalytics = withAuth(OwnerAnalyticsPage, ['owner']);
export const ProtectedOwnerBranding = withAuth(OwnerBrandingPage, ['owner']);

// You can also protect routes for multiple roles
// export const ProtectedSharedResource = withAuth(SharedResource, ['admin', 'owner']);