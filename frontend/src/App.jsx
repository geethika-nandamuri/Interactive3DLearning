import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@contexts/ThemeContext';
import { AuthProvider } from '@contexts/AuthContext';
import { SelectedMeshProvider } from '@contexts/SelectedMeshContext';
import ProtectedRoute from '@components/ProtectedRoute';
import LandingPage from '@pages/LandingPage';
import LoginPage from '@pages/LoginPage';
import DashboardLayout from '@layouts/DashboardLayout';
import DashboardPage from '@pages/DashboardPage';
import AnatomyPage from '@pages/AnatomyPage';
import BiologyPage from '@pages/BiologyPage';
import EngineeringPage from '@pages/EngineeringPage';
import ChemistryPage from '@pages/ChemistryPage';
import ArchitecturePage from '@pages/ArchitecturePage';
import ProgressPage from '@pages/ProgressPage';
import SettingsPage from '@pages/SettingsPage';
import QuizPage from '@pages/QuizPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectedMeshProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Landing & Auth pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="anatomy" element={<AnatomyPage />} />
                <Route path="biology" element={<BiologyPage />} />
                <Route path="engineering" element={<EngineeringPage />} />
                <Route path="chemistry" element={<ChemistryPage />} />
                <Route path="architecture" element={<ArchitecturePage />} />
                <Route path="quiz" element={<QuizPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Default Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SelectedMeshProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
