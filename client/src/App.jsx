import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers & Guards
import { AuthProvider } from './context/AuthContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Layout shell
import MainLayout from './layouts/MainLayout.jsx';

// Public Pages
import LoginPage from './pages/LoginPage.jsx';
import UnauthorizedPage from './pages/UnauthorizedPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ServerErrorPage from './pages/ServerErrorPage.jsx';

// Core Dashboard Pages
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import MapPage from './pages/MapPage.jsx';

// Intelligence Module Pages
import ChatPage from './pages/ChatPage.jsx';
import NetworkPage from './pages/NetworkPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// Decision, Forecasting & Planning Pages
import DecisionSupportPage from './pages/DecisionSupportPage.jsx';
import PredictionPage from './pages/PredictionPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <UIProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Access Control Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="/404" element={<NotFoundPage />} />

              {/* Secure Portal Container Guard */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                  {/* Default redirect to Dashboard */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Core Navigation (Available to all authenticated personnel) */}
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="map" element={<MapPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="decision-support" element={<DecisionSupportPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />

                  {/* Cyber & Criminal Intelligence (Investigators, Analysts, Supervisors) */}
                  <Route 
                    path="chat" 
                    element={
                      <ProtectedRoute allowedRoles={['Investigator', 'Analyst', 'Supervisor']}>
                        <ChatPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="network" 
                    element={
                      <ProtectedRoute allowedRoles={['Investigator', 'Analyst', 'Supervisor']}>
                        <NetworkPage />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Analytical predictions (Analysts & Supervisors only) */}
                  <Route 
                    path="prediction" 
                    element={
                      <ProtectedRoute allowedRoles={['Analyst', 'Supervisor']}>
                        <PredictionPage />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Administrative Privilege Controls (Supervisors only) */}
                  <Route 
                    path="admin" 
                    element={
                      <ProtectedRoute allowedRoles={['Supervisor']}>
                        <AdminPage />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
              </Route>

              {/* Catch-All redirects to 404 */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </UIProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
