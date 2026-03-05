import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, AlertCircle, CheckCircle, Clock, BarChart3 } from 'lucide-react'
import { analyticsAPI } from '@/api'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsAPI.getDashboardStats()
        setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, description, variant = 'default' }) => {
    const getVariantStyles = (v) => {
      const variants = {
        default: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800',
        success: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800',
        warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800',
        danger: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border-red-200 dark:border-red-800',
      }
      return variants[v] || variants.default
    }

    return (
      <Card className={`border-2 ${getVariantStyles(variant)} shadow-sm hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
            {Icon && <Icon className="w-5 h-5 text-muted-foreground/50" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-3xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome! Here's your overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          Updated just now
        </div>
      </div>

      {stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Complaints"
              value={stats.totalComplaints}
              icon={BarChart3}
              variant="default"
            />
            <StatCard
              title="Avg Rating"
              value={stats.averageRating?.toFixed(1)}
              description="Customer satisfaction"
              variant="success"
            />
            <StatCard
              title="Resolution Rate"
              value={`${stats.resolutionRate}%`}
              icon={CheckCircle}
              description="Closed complaints"
              variant="success"
            />
            <StatCard
              title="SLA Breaches"
              value={stats.slaBreaches}
              icon={AlertCircle}
              variant="danger"
            />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* By Status */}
            <Card className="shadow-sm hover:shadow-md transition-shadow lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  By Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <Badge variant="secondary" className="text-lg">{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* By Priority */}
            <Card className="shadow-sm hover:shadow-md transition-shadow lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  By Priority
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byPriority || {}).map(([priority, count]) => (
                  <div key={priority} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Badge variant={priority.toLowerCase()} className="capitalize">
                      {priority}
                    </Badge>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* By Department */}
            {stats.byDepartment?.length > 0 && (
              <Card className="shadow-sm hover:shadow-md transition-shadow lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    By Department
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.byDepartment.slice(0, 5).map((dept) => {
                    const maxCount = Math.max(...stats.byDepartment.map((d) => d.count))
                    const percentage = (dept.count / maxCount) * 100

                    return (
                      <div key={dept.department} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{dept.department}</span>
                          <span className="text-sm font-semibold text-muted-foreground">{dept.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
