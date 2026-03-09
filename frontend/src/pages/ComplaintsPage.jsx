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
  const { addToast } = useToast()
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
      addToast('Failed to load complaints', 'error')
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">📋 Complaints</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Manage and track all complaints across departments</p>
        </div>

        {user?.role === 'complainant' && (
              <Button className="gap-2 w-full sm:w-auto" onClick={() => navigate('/complaints/new')}>
                <Plus className="w-4 h-4" />
                File Complaint
              </Button>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background text-xs sm:text-sm"
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
                className="w-full px-3 py-2 border rounded-lg bg-background text-xs sm:text-sm"
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
                className="w-full px-3 py-2 border rounded-lg bg-background text-xs sm:text-sm"
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
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden sm:table-cell">Department</TableHead>
                      <TableHead className="hidden md:table-cell">Priority</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedComplaints.map((complaint) => (
                      <TableRow key={complaint.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/complaints/${complaint.id}`)}>
                        <TableCell className="font-mono text-xs sm:text-sm font-semibold">{complaint.complaintCode}</TableCell>
                        <TableCell className="font-medium text-sm">{complaint.title}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          <span className="text-xs">{complaint.department?.name || 'N/A'}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getPriorityVariant(complaint.priority)} className="text-xs">{complaint.priority}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{formatDate(complaint.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(complaint.status)} className="text-xs">{complaint.status}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu >
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-50 bg-white">
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedComplaints.map((complaint) => (
                  <div 
                    key={complaint.id} 
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                    className="border border-border rounded-lg p-4 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs font-semibold text-muted-foreground">{complaint.complaintCode}</p>
                        <h4 className="font-semibold text-sm text-foreground line-clamp-2">{complaint.title}</h4>
                      </div>
                      <Badge variant={getStatusVariant(complaint.status)} className="text-xs flex-shrink-0">
                        {complaint.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant={getPriorityVariant(complaint.priority)} className="text-xs">
                        {complaint.priority}
                      </Badge>
                      {complaint.department && (
                        <span className="text-muted-foreground">{complaint.department.name}</span>
                      )}
                      <span className="text-muted-foreground">{formatDate(complaint.createdAt)}</span>
                    </div>

                    <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                        className="flex-1 text-xs h-8"
                      >
                        View Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8">
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
                    </div>
                  </div>
                ))}
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


