import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, TrendingUp, Users, BarChart3, FileText, UserPlus, Layers, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '@/api'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [filterStatus, user?.departmentId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch complaints for this manager's department
      const params = {
        departmentId: user?.departmentId
      }
      if (filterStatus !== 'all') params.status = filterStatus
      
      const response = await api.get('/complaints', { params })
      setComplaints(response.data.data || [])

      // Calculate stats
      const allComplaints = response.data.data || []
      setStats({
        total: allComplaints.length,
        registered: allComplaints.filter(c => c.status === 'Registered').length,
        assigned: allComplaints.filter(c => c.status === 'Assigned').length,
        inProgress: allComplaints.filter(c => c.status === 'InProgress').length,
        resolved: allComplaints.filter(c => c.status === 'Resolved').length,
        closed: allComplaints.filter(c => c.status === 'Closed').length,
        escalated: allComplaints.filter(c => c.status === 'Escalated').length,
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComplaints = complaints.filter(
    (c) =>
      c.complaintCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      Registered: 'status-badge-pending',
      Assigned: 'status-badge-assigned',
      InProgress: 'status-badge-in-progress',
      Resolved: 'status-badge-resolved',
      Closed: 'status-badge-closed',
      Escalated: 'status-badge-escalated',
    }
    return classes[status] || 'status-badge'
  }

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      Medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return classes[priority] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Department Manager Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage complaints and staff in your department
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/manager/staff')}
            className="modern-card-hover p-6 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Manage Staff</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add and manage staff members</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/categories')}
            className="modern-card-hover p-6 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Categories</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage complaint categories</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/complaints')}
            className="modern-card-hover p-6 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">All Complaints</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View department complaints</p>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="modern-card-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Complaints
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              In your department
            </p>
          </div>

          <div className="modern-card-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Pending
            </h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {(stats.registered || 0) + (stats.assigned || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Awaiting action
            </p>
          </div>

          <div className="modern-card-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.inProgress || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Being worked on
            </p>
          </div>

          <div className="modern-card-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Resolved
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {(stats.resolved || 0) + (stats.closed || 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Successfully closed
            </p>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="modern-card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Complaints
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Latest complaints in your department
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-10"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="modern-select"
              >
                <option value="all">All Statuses</option>
                <option value="Registered">Registered</option>
                <option value="Assigned">Assigned</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredComplaints.length === 0 ? (
              <div className="py-16 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No complaints found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search' : 'No complaints in your department yet'}
                </p>
              </div>
            ) : (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.slice(0, 10).map((complaint) => (
                    <tr key={complaint.id}>
                      <td>
                        <span className="font-mono text-sm font-semibold text-primary">
                          {complaint.complaintCode}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium max-w-xs truncate block">
                          {complaint.title}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(complaint.status)}>
                          {complaint.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {complaint.assignedTo?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-500 dark:text-gray-500">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/complaints/${complaint.id}`)}
                          className="btn btn-ghost btn-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

  const filteredComplaints = complaints.filter(
    (c) =>
      c.complaintCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: 'critical',
      High: 'high',
      Medium: 'medium',
      Low: 'low',
    }
    return colors[priority] || 'default'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Department Manager Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage and track complaints in your department</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">out of 5 stars</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolutionRate || '0%'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">SLA Breaches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.slaBreaches || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Complaints</CardTitle>
          <CardDescription>Manage and assign complaints to your staff</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Escalated">Escalated</option>
            </select>
          </div>

          {/* Table */}
          {filteredComplaints.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.complaintCode}</TableCell>
                      <TableCell className="max-w-xs truncate">{complaint.title}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(complaint.status)}>{complaint.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {complaint.assignedTo ? (
                          <div className="text-sm">
                            <p className="font-medium">{complaint.assignedTo.name}</p>
                            <p className="text-xs text-muted-foreground">{complaint.assignedTo.email}</p>
                          </div>
                        ) : (
                          <Badge variant="secondary">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(complaint.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/complaints/${complaint.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No complaints found</p>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
