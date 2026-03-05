import { useState, useEffect } from 'react'
import { Plus, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { complaintAPI } from '@/api'
import { useNavigate } from 'react-router-dom'

export default function UserDashboard() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const params = {}
        if (filterStatus !== 'all') params.status = filterStatus
        const response = await complaintAPI.getComplaints(params)
        setComplaints(response.data.data || [])
      } catch (error) {
        console.error('Error fetching complaints:', error)
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

  const stats = {
    total: complaints.length,
    resolved: complaints.filter((c) => c.status === 'Resolved').length,
    pending: complaints.filter((c) => ['Registered', 'Assigned', 'InProgress'].includes(c.status)).length,
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">My Complaints</h1>
          <p className="text-muted-foreground mt-1">Track and manage your filed complaints</p>
        </div>
        <Button
          onClick={() => navigate('/complaints/new')}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          File New Complaint
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Complaints</span>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Pending</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-2">Being processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span>Resolved</span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground mt-2">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Complaints List</CardTitle>
          <CardDescription>View and manage all your filed complaints</CardDescription>
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
                        <Badge variant={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {complaint.assignedTo ? (
                          <div className="text-sm">
                            <p className="font-medium">{complaint.assignedTo.name}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Pending</span>
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
              {complaints.length === 0 ? (
                <>
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No complaints filed yet</p>
                  <Button onClick={() => navigate('/complaints/new')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    File Your First Complaint
                  </Button>
                </>
              ) : (
                <>
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints found matching your search</p>
                </>
              )}
            </div>
          )}

          {/* Info */}
          {complaints.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
