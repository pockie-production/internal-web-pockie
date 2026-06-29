import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { trackInternalEvent } from './lib/analytics';
import Login from './pages/Login';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { InternalLayout } from './layouts/InternalLayout';
import { EkycListPage } from './pages/ekyc/EkycListPage';
import { EkycDetailPage } from './pages/ekyc/EkycDetailPage';
import { UsersPage } from './pages/UsersPage';
import { TrendsPage } from './pages/TrendsPage';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RouteTracker = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const feature =
      location.pathname.startsWith('/dashboard') ? 'internal_dashboard' :
      location.pathname.startsWith('/users') ? 'users' :
      location.pathname.startsWith('/trends') ? 'trends' :
      location.pathname.startsWith('/ekyc-review') ? 'ekyc_review' :
      location.pathname.startsWith('/analytics') ? 'analytics' :
      undefined;

    trackInternalEvent({
      eventName: 'page_view',
      page: location.pathname,
      feature,
    });
  }, [isAuthenticated, location.pathname]);

  return null;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <RouteTracker />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Internal Routes wrapped in Layout */}
        <Route
          element={
            <ProtectedRoute>
              <InternalLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/ekyc-review" element={<EkycListPage />} />
          <Route path="/ekyc-review/:id" element={<EkycDetailPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/vouchers" element={<PlaceholderPage />} />
          <Route path="/banks" element={<PlaceholderPage />} />
          <Route path="/campaigns" element={<PlaceholderPage />} />
          <Route path="/analytics" element={<PlaceholderPage />} />
          <Route path="/audit-logs" element={<PlaceholderPage />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
