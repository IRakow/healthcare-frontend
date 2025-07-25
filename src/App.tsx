import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRoutes } from './components/AppRoutes';
import TenantRouter from './components/TenantRouter';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ErrorBoundary>
          <AuthProvider>
            <TenantRouter>
              <AppRoutes />
            </TenantRouter>
          </AuthProvider>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}