import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-6xl font-bold text-muted-foreground">404</div>
          </div>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            It might have been deleted or you might have mistyped the URL.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="flex-1 gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ServerErrorPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-lg border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-destructive">Server Error</CardTitle>
          <CardDescription>
            Something went wrong on our end. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Our team has been notified and we're working to fix the issue.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              Refresh Page
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="flex-1 gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-lg border-yellow-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="text-6xl font-bold text-yellow-600">401</div>
          </div>
          <CardTitle>Unauthorized</CardTitle>
          <CardDescription>
            You don't have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Please log in or contact your administrator for access.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              className="flex-1"
            >
              Log In
            </Button>
            <Button onClick={() => navigate('/dashboard')} className="flex-1">
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
