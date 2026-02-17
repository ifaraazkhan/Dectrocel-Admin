import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LicenseList from './pages/Licenses/LicenseList';
import ReportsList from './pages/Reports/ReportsList';
import LicenseManagementReport from './pages/Reports/LicenseManagementReport';
import UsageMetricsReport from './pages/Reports/UsageMetricsReport';
import RevenuePaymentReport from './pages/Reports/RevenuePaymentReport';
import AIAnalysisReport from './pages/Reports/AIAnalysisReport';
import UserActivityReport from './pages/Reports/UserActivityReport';
import DesktopSyncReport from './pages/Reports/DesktopSyncReport';
import SystemHealthReport from './pages/Reports/SystemHealthReport';
import NotificationTrackingReport from './pages/Reports/NotificationTrackingReport';
import AuditLogs from './pages/AuditLogs';
import SubscriptionPlans from './pages/Subscriptions/SubscriptionPlans';
import UserSubscriptions from './pages/Subscriptions/UserSubscriptions';
import SubscriptionActivity from './pages/Subscriptions/SubscriptionActivity';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return user ? (
    <MainLayout>{children}</MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/licenses"
              element={
                <PrivateRoute>
                  <LicenseList />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <ReportsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/license-management"
              element={
                <PrivateRoute>
                  <LicenseManagementReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/revenue-payment"
              element={
                <PrivateRoute>
                  <RevenuePaymentReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/usage-metrics"
              element={
                <PrivateRoute>
                  <UsageMetricsReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/ai-analysis"
              element={
                <PrivateRoute>
                  <AIAnalysisReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/user-activity"
              element={
                <PrivateRoute>
                  <UserActivityReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/desktop-sync"
              element={
                <PrivateRoute>
                  <DesktopSyncReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/system-health"
              element={
                <PrivateRoute>
                  <SystemHealthReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/notifications"
              element={
                <PrivateRoute>
                  <NotificationTrackingReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/subscriptions/plans"
              element={
                <PrivateRoute>
                  <SubscriptionPlans />
                </PrivateRoute>
              }
            />
            <Route
              path="/subscriptions/users"
              element={
                <PrivateRoute>
                  <UserSubscriptions />
                </PrivateRoute>
              }
            />
            <Route
              path="/subscriptions/activity"
              element={
                <PrivateRoute>
                  <SubscriptionActivity />
                </PrivateRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <PrivateRoute>
                  <AuditLogs />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
