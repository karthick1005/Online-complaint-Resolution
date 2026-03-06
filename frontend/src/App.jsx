import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { setLogoutCallback } from '@/api'
import AppLayout from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import ComplaintsPage from '@/pages/ComplaintsPage'
import ComplaintDetailPage from '@/pages/ComplaintDetailPage'
import CreateComplaintPage from '@/pages/CreateComplaintPage'
import UsersPage from '@/pages/UsersPage'
import ProfilePage from '@/pages/ProfilePage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import StaffDashboard from '@/pages/StaffDashboard'
import { NotFoundPage, ServerErrorPage, UnauthorizedPage } from '@/pages/ErrorPages'

// Admin Pages
import DepartmentManagement from '@/pages/admin/DepartmentManagement'
import ManagerManagement from '@/pages/admin/ManagerManagement'
import CategoryManagement from '@/pages/admin/CategoryManagement'

// Manager Pages
import StaffManagement from '@/pages/manager/StaffManagement'

function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    // Set up logout callback for API interceptor
    setLogoutCallback(() => {
      navigate('/login')
    })
  }, [navigate])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout>
              <DepartmentManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/managers"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout>
              <ManagerManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute roles={['admin', 'department_manager']}>
            <AppLayout>
              <CategoryManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Manager Routes */}
      <Route
        path="/manager/staff"
        element={
          <ProtectedRoute roles={['department_manager']}>
            <AppLayout>
              <StaffManagement />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ComplaintsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/new"
        element={
          <ProtectedRoute roles={['complainant']}>
            <AppLayout>
              <CreateComplaintPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ComplaintDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AppLayout>
              <UsersPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AnalyticsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff"
        element={
          <ProtectedRoute roles={['department_manager', 'admin']}>
            <AppLayout>
              <StaffDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/error" element={<ServerErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}
