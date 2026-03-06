import { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreHorizontal, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { complaintAPI, departmentAPI } from '@/api'
import { Pagination } from '@/components/ui/Pagination'
import { getDepartmentList } from '@/lib/departments'

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const itemsPerPage = 10

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const result = await departmentAPI.getDepartments().catch(() => null);
        if (result?.data) {
          setDepartments(result.data);
        } else {
          // Fallback to local departments data
          const deptList = getDepartmentList();
          setDepartments(deptList.map((name, idx) => ({ id: `dept-${idx}`, name })));
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchComplaints()
  }, [filterStatus, filterPriority, filterDepartment])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterPriority, filterDepartment])

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterPriority !== 'all') params.priority = filterPriority
      if (filterDepartment !== 'all') params.departmentId = filterDepartment
      
      // If user is complainant, show only their complaints
      if (user?.role === 'complainant') {
        params.userId = user.id
      }
      
      const response = await complaintAPI.getComplaints(params)
      setComplaints(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
      showToast('Failed to load complaints', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredComplaints = complaints.filter((c) =>
    c.complaintCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterPriority('all')
    setFilterDepartment('all')
    setCurrentPage(1)
  }

  const activeFiltersCount = [
    filterStatus !== 'all',
    filterPriority !== 'all',
    filterDepartment !== 'all',
    searchTerm !== '',
  ].filter(Boolean).length

  const getPriorityVariant = (priority) => {
    const variants = {
      Critical: 'critical',
      High: 'high',
      Medium: 'medium',
      Low: 'low',
    }
    return variants[priority] || 'default'
  }

  const getStatusVariant = (status) => {
    const variants = {
      Registered: 'registered',
      Assigned: 'assigned',
      InProgress: 'inprogress',
      Resolved: 'resolved',
      Closed: 'closed',
      Escalated: 'escalated',
    }
    return variants[status] || 'default'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">📋 Complaints</h1>
          <p className="text-muted-foreground mt-1">Manage and track all complaints across departments</p>
        </div>

        {user?.role === 'complainant' && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                File Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Complaint</DialogTitle>
                <DialogDescription>File a new complaint to get it resolved</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Button onClick={() => navigate('/complaints/new')} className="w-full">
                  Create Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id || dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
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

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="text-muted-foreground">No complaints found</p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedComplaints.map((complaint) => (
                      <TableRow key={complaint.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                        <TableCell className="font-mono text-sm font-semibold">{complaint.complaintCode}</TableCell>
                        <TableCell className="font-medium">{complaint.title}</TableCell>
                        <TableCell>
                          <span className="text-sm">{complaint.department?.name || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(complaint.priority)}>{complaint.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(complaint.status)}>{complaint.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(complaint.createdAt)}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/complaints/${complaint.id}`)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Add Comment</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


