import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, TrendingUp, UserPlus, Layers, Search, FileText, BarChart3 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { analyticsAPI, complaintAPI, getErrorMessage, getResponseData } from '@/api'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user?.departmentId) {
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        const complaintFilters = {
          departmentId: user.departmentId,
          page: 1,
          pageSize: 10,
        }

        if (filterStatus !== 'all') {
          complaintFilters.status = filterStatus
        }

        if (searchTerm.trim()) {
          complaintFilters.search = searchTerm.trim()
        }

        const [statsResponse, complaintsResponse] = await Promise.all([
          analyticsAPI.getDashboardStats(),
          complaintAPI.getComplaints(complaintFilters),
        ])

        setStats(getResponseData(statsResponse, {}))
        setComplaints(getResponseData(complaintsResponse, []))
      } catch (error) {
        console.error('Failed to fetch manager dashboard data:', getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filterStatus, searchTerm, user?.departmentId])

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

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

  const byStatus = stats.byStatus || {}
  const pendingCount = (byStatus.Registered || 0) + (byStatus.Assigned || 0)
  const resolvedCount = (byStatus.Resolved || 0) + (byStatus.Closed || 0)

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Department Manager Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage complaints and staff in your department
          </p>
        </div>

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
              {stats.totalComplaints || 0}
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
              {pendingCount}
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
              {byStatus.InProgress || 0}
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
              {resolvedCount}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Successfully closed
            </p>
          </div>
        </div>

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
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-input pl-12"
                  style={{ paddingLeft: '3rem' }}
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
            {complaints.length === 0 ? (
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
                  {complaints.map((complaint) => (
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
