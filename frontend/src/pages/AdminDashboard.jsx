import { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp, BarChart3, Users, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { analyticsAPI, complaintAPI, departmentAPI } from '@/api'
import { getDepartmentList } from '@/lib/departments'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch departments
        const deptResult = await departmentAPI.getDepartments().catch(() => null);
        if (deptResult?.data) {
          setDepartments(deptResult.data);
        } else {
          const deptList = getDepartmentList();
          setDepartments(deptList.map((name, idx) => ({ id: `dept-${idx}`, name })));
        }

        // Fetch all complaints
        const complaintsRes = await complaintAPI.getComplaints({ limit: 100 })
        setComplaints(complaintsRes.data.data || [])

        // Fetch stats
        const statsRes = await analyticsAPI.getDashboardStats()
        setStats(statsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      Registered: 'registered',
      Assigned: 'assigned',
      InProgress: 'inprogress',
      Resolved: 'resolved',
      Closed: 'closed',
      Escalated: 'escalated',
    }
    return colors[status] || 'default'
  }

  // Calculate complaints by department
  const complaintsByDepartment = departments.map(dept => ({
    ...dept,
    count: complaints.filter(c => c.departmentId === dept.id || c.department?.name === dept.name).length
  }));

  // Calculate status distribution
  const statusDistribution = {
    registered: complaints.filter(c => c.status === 'Registered').length,
    assigned: complaints.filter(c => c.status === 'Assigned').length,
    inProgress: complaints.filter(c => c.status === 'InProgress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    closed: complaints.filter(c => c.status === 'Closed').length,
    escalated: complaints.filter(c => c.status === 'Escalated').length,
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">👨‍💼 Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and multi-department analytics</p>
      </div>

      {/* Main KPI Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Total Complaints</span>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComplaints || complaints.length}</div>
                <p className="text-xs text-muted-foreground mt-2">All time complaints</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Departments</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
                <p className="text-xs text-muted-foreground mt-2">Active departments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Resolution Rate</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.resolutionRate }
                </div>
                <p className="text-xs text-muted-foreground mt-2">Closed complaints</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>SLA Breaches</span>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.slaBreaches || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Urgent attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Overview */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Complaints by Department</CardTitle>
              <CardDescription>Distribution across all 8 departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complaintsByDepartment.map((dept) => {
                  const percentage = complaints.length > 0 ? ((dept.count / complaints.length) * 100).toFixed(1) : 0
                  return (
                    <div key={dept.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{dept.name}</span>
                          <Badge variant="secondary">{dept.count}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status and Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Status */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Complaints by Status</CardTitle>
                <CardDescription>Current distribution across all statuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Registered', count: statusDistribution.registered, color: 'bg-yellow-600' },
                  { label: 'Assigned', count: statusDistribution.assigned, color: 'bg-blue-600' },
                  { label: 'In Progress', count: statusDistribution.inProgress, color: 'bg-purple-600' },
                  { label: 'Resolved', count: statusDistribution.resolved, color: 'bg-green-600' },
                  { label: 'Closed', count: statusDistribution.closed, color: 'bg-gray-600' },
                  { label: 'Escalated', count: statusDistribution.escalated, color: 'bg-red-600' }
                ].map((status) => {
                  const total = complaints.length || 1
                  const percentage = ((status.count / total) * 100).toFixed(1)
                  return (
                    <div key={status.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${status.color}`} />
                          <span className="text-sm font-medium">{status.label}</span>
                          <Badge variant="secondary">{status.count}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${status.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* By Priority */}
            <Card>
              <CardHeader>
                <CardTitle>⚠️ Complaints by Priority</CardTitle>
                <CardDescription>Severity distribution across system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Critical', 'High', 'Medium', 'Low'].map((priority) => {
                  const count = complaints.filter(c => c.priority === priority).length
                  const total = complaints.length || 1
                  const percentage = ((count / total) * 100).toFixed(1)
                  const colorMap = {
                    Critical: 'bg-red-600',
                    High: 'bg-orange-600',
                    Medium: 'bg-yellow-600',
                    Low: 'bg-green-600'
                  }
                  return (
                    <div key={priority} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colorMap[priority]}`} />
                          <span className="text-sm font-medium">{priority}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colorMap[priority]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recent Complaints */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Recent Complaints</CardTitle>
              <CardDescription>Latest 5 complaints across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complaints.slice(0, 5).map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{complaint.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {complaint.complaintCode} • {complaint.department?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={complaint.priority === 'Critical' ? 'critical' : complaint.priority === 'High' ? 'high' : 'medium'}>
                        {complaint.priority}
                      </Badge>
                      <Badge variant={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

      {/* Main KPI Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Total Complaints</span>
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalComplaints}</div>
                <p className="text-xs text-muted-foreground mt-2">All time complaints</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Resolution Rate</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolutionRate || '0%'}</div>
                <p className="text-xs text-muted-foreground mt-2">Closed complaints</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Average Rating</span>
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating?.toFixed(2) || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">out of 5.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>SLA Breaches</span>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.slaBreaches || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Urgent attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Status and Priority Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Status */}
            <Card>
              <CardHeader>
                <CardTitle>Complaints by Status</CardTitle>
                <CardDescription>Distribution across all statuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.byStatus && Object.entries(stats.byStatus).length > 0 ? (
                  Object.entries(stats.byStatus).map(([status, count]) => {
                    const total = stats.totalComplaints
                    const percentage = ((count / total) * 100).toFixed(1)
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(status)}>{status}</Badge>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* By Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Complaints by Priority</CardTitle>
                <CardDescription>Distribution across priority levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.byPriority && Object.entries(stats.byPriority).length > 0 ? (
                  Object.entries(stats.byPriority).map(([priority, count]) => {
                    const total = stats.totalComplaints
                    const percentage = ((count / total) * 100).toFixed(1)
                    return (
                      <div key={priority} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(priority)}>{priority}</Badge>
                            <span className="text-sm text-muted-foreground">{count}</span>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* By Department */}
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Department</CardTitle>
              <CardDescription>Workload distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.byDepartment && stats.byDepartment.length > 0 ? (
                <div className="space-y-4">
                  {stats.byDepartment.map((dept) => {
                    const percentage = ((dept.count / stats.totalComplaints) * 100).toFixed(1)
                    return (
                      <div key={dept.department} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{dept.department}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{dept.count}</span>
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Recent Complaints */}
      {complaints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Latest submissions from the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.slice(0, 5).map((complaint) => (
                <div key={complaint.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{complaint.complaintCode}</p>
                      <Badge variant={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{complaint.title}</p>
                    <p className="text-xs text-muted-foreground">{complaint.user?.name}</p>
                  </div>
                  <Badge variant={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
