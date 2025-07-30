import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BrandingProvider } from '@/contexts/BrandingProvider';
import TenantRouter from './components/TenantRouter';
import AppRoutes from './components/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  console.log('[App] Starting to render');
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <BrandingProvider>
              <TenantRouter>
                <AppRoutes />
              </TenantRouter>
            </BrandingProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}