import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { complaintAPI } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function StaffDashboard() {
  const { user } = useAuth()
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

  const myAssignedComplaints = complaints.filter(
    (c) => c.assignedTo?.id === user?.id
  )
  const inProgressCount = myAssignedComplaints.filter(
    (c) => c.status === 'InProgress'
  ).length
  const resolvedCount = myAssignedComplaints.filter(
    (c) => c.status === 'Resolved'
  ).length

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track and manage your assigned complaints</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned to Me</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAssignedComplaints.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Total assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting closure</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Assignments</CardTitle>
          <CardDescription>Complaints assigned to you for resolution</CardDescription>
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
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
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
                    <TableHead>Assigned By</TableHead>
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
                      <TableCell className="text-sm">
                        {complaint.user?.name || 'Unknown'}
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
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No complaints found matching your search' : 'No complaints assigned yet'}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredComplaints.length} of {complaints.length} assignments
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
