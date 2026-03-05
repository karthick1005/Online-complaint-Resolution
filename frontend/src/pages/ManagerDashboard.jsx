import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { complaintAPI, analyticsAPI } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch complaints
        const complaintParams = {}
        if (filterStatus !== 'all') complaintParams.status = filterStatus
        const complaintRes = await complaintAPI.getComplaints(complaintParams)
        setComplaints(complaintRes.data.data || [])

        // Fetch stats
        const statsRes = await analyticsAPI.getDashboardStats()
        setStats(statsRes.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filterStatus])

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
