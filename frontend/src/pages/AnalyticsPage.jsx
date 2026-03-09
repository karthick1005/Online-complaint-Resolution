import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { analyticsAPI } from '@/api'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const { addToast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.getDashboardStats()
      setStats(response.data)
    } catch (error) {
      addToast('Failed to load analytics', 'error')
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  const StatBox = ({ label, value, subtext, trend }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          {trend && (
            <div className={`text-sm font-semibold ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'admin' && 'System-wide performance metrics and insights'}
            {user?.role === 'department_manager' && 'Your department performance metrics'}
            {user?.role === 'staff' && 'Your department performance metrics'}
            {user?.role === 'complainant' && 'Your complaints analytics'}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatBox label="Total Complaints" value={stats.totalComplaints || 0} subtext="All time" trend={5.2} />
        <StatBox label="Resolution Rate" value={stats.resolutionRate || '0%'} subtext="Closed complaints" trend={3.1} />
        {stats.slaBreaches !== undefined && (
          <StatBox label="SLA Breaches" value={stats.slaBreaches || 0} subtext="Overdue complaints" trend={-2.5} />
        )}
        <StatBox label="Average Rating" value={stats.averageRating ? stats.averageRating.toFixed(1) : 0} subtext="Out of 5 stars" />
        <StatBox label="Total Users" value="—" subtext="Pending integration" />
        <StatBox label="Avg Response Time" value="—" subtext="Under development" trend={1.8} />
      </div>

      {/* Status Distribution */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Complaints by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium capitalize">{status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 bg-muted rounded-full overflow-hidden w-40">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60"
                      style={{ width: `${(count / stats.totalComplaints) * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold text-sm w-12 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Priority Distribution</CardTitle>
          <CardDescription>Complaints by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.byPriority).map(([priority, count]) => {
              const getColor = (p) => {
                const colors = {
                  Critical: 'destructive',
                  High: 'default',
                  Medium: 'secondary',
                  Low: 'outline',
                }
                return colors[p] || 'outline'
              }

              return (
                <div key={priority} className="text-center p-4 rounded-lg bg-muted/50">
                  <Badge variant={getColor(priority)} className="capitalize mb-2">
                    {priority}
                  </Badge>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((count / stats.totalComplaints) * 100).toFixed(1)}%
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      {stats.byDepartment && stats.byDepartment.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Complaints by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byDepartment.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept.department}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-8 bg-muted rounded-full overflow-hidden w-40">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${(dept.count / stats.totalComplaints) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-sm w-12 text-right">{dept.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Info */}
      <Card className="shadow-sm bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analytics Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Total Complaints:</span> {stats.totalComplaints}
            </p>
            <p>
              <span className="font-medium">Resolution Rate:</span> {stats.resolutionRate}
            </p>
            {stats.slaBreaches !== undefined && (
              <p>
                <span className="font-medium">SLA Breaches:</span> {stats.slaBreaches}
              </p>
            )}
            {stats.averageRating > 0 && (
              <p>
                <span className="font-medium">Average Rating:</span> {stats.averageRating.toFixed(1)}/5 ✨
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
