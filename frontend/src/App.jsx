// Main application routing and layout
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import useNotifications from './hooks/useNotifications';
import Login from './pages/Login';
import Register from './pages/RegisterDisabled';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Kanban from './pages/Kanban';
import Teams from './pages/Teams';
import UserManagement from './pages/UserManagement';
import UserAnalytics from './pages/UserAnalytics';
import HRManagement from './pages/HRManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import ChangeLog from './pages/ChangeLog';
import ColorPreview from './pages/ColorPreview';
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetail from './pages/projects/ProjectDetail';
import ProjectSettings from './pages/projects/ProjectSettings';

// Separate component to ensure hooks are called within AuthProvider
function NotificationManager() {
  useNotifications();
  return null;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      {/* Only initialize notifications when user is logged in */}
      {user && <NotificationManager />}
      
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/kanban"
        element={
          <ProtectedRoute>
            <Kanban />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teams"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hr', 'team_lead']}>
            <Teams />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hr']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:userId/analytics"
        element={
          <ProtectedRoute>
            <UserAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr-management"
        element={
          <ProtectedRoute allowedRoles={['admin', 'hr']}>
            <HRManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />

      <Route
        path="/changelog"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ChangeLog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/color-preview"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ColorPreview />
          </ProtectedRoute>
        }
      />

      {/* Project Management Routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id/settings"
        element={
          <ProtectedRoute>
            <ProjectSettings />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;