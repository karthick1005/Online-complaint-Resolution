import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { setLogoutCallback } from '@/api'
import AppLayout from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingPage } from '@/components/ui/LoadingSpinner'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ComplaintsPage = lazy(() => import('@/pages/ComplaintsPage'))
const ComplaintDetailPage = lazy(() => import('@/pages/ComplaintDetailPage'))
const CreateComplaintPage = lazy(() => import('@/pages/CreateComplaintPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const StaffDashboard = lazy(() => import('@/pages/StaffDashboard'))
const DepartmentManagement = lazy(() => import('@/pages/admin/DepartmentManagement'))
const ManagerManagement = lazy(() => import('@/pages/admin/ManagerManagement'))
const CategoryManagement = lazy(() => import('@/pages/admin/CategoryManagement'))
const StaffManagement = lazy(() => import('@/pages/manager/StaffManagement'))
const NotFoundPage = lazy(() =>
  import('@/pages/ErrorPages').then((module) => ({ default: module.NotFoundPage }))
)
const ServerErrorPage = lazy(() =>
  import('@/pages/ErrorPages').then((module) => ({ default: module.ServerErrorPage }))
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/ErrorPages').then((module) => ({ default: module.UnauthorizedPage }))
)

function RouteLoader({ children }) {
  return <Suspense fallback={<LoadingPage />}>{children}</Suspense>
}

function AppRoutes() {
  const navigate = useNavigate()

  useEffect(() => {
    setLogoutCallback(() => {
      navigate('/login')
    })
  }, [navigate])

  return (
    <RouteLoader>
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
    </RouteLoader>
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
