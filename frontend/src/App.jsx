import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { setLogoutCallback } from '@/api'
import AppLayout from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ComplaintsPage from '@/pages/ComplaintsPage'
import ComplaintDetailPage from '@/pages/ComplaintDetailPage'
import CreateComplaintPage from '@/pages/CreateComplaintPage'

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

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}
