import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { Pagination } from '@/components/ui/Pagination'
import { userAPI } from '@/api'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [departments, setDepartments] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'complainant',
    departmentId: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const { addToast } = useToast()
  const { user: currentUser } = useAuth()
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [roleFilter])

  const fetchDepartments = async () => {
    try {
      const response = await userAPI.getDepartments()
      setDepartments(response.data?.data || [])
    } catch (error) {
      console.error('Failed to load departments:', error)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getAllUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined
      })
      setUsers(response.data.data || [])
    } catch (error) {
      addToast('Failed to load users', 'error')
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      addToast('Cannot delete your own account', 'error')
      return
    }

    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId)
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        addToast('User deleted successfully', 'success')
      } catch (error) {
        addToast('Failed to delete user', 'error')
      }
    }
  }

  const handleToggleActive = async (userId) => {
    try {
      const response = await userAPI.toggleUserStatus(userId)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isActive: response.data.user.isActive } : u
        )
      )
      addToast(response.data.message, 'success')
    } catch (error) {
      addToast('Failed to update user status', 'error')
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Valid email is required'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (!formData.role) errors.role = 'Role is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setFormLoading(true)
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        departmentId: formData.departmentId || undefined
      }
      
      const response = await userAPI.createUser(userData)
      setUsers((prev) => [response.data.user, ...prev])
      addToast('User created successfully', 'success')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'complainant',
        departmentId: ''
      })
      setFormErrors({})
      setShowAddForm(false)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to create user', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Filter and search
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm)
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const getRoleColor = (role) => {
    const colors = {
      admin: 'destructive',
      department_manager: 'default',
      staff: 'secondary',
      complainant: 'outline',
      guest: 'outline',
    }
    return colors[role] || 'outline'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and their roles</p>
        </div>
        <Button 
          className="gap-2 w-full sm:w-auto"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="department_manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="complainant">Complainant</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Total {users.length} users in system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : paginatedUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                        <TableCell className="text-sm">{user.phone}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getRoleColor(user.role)}
                            className="capitalize"
                          >
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'secondary' : 'outline'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">⋯</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(user.id)}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              {user.id !== currentUser?.id && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your search
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Create a new user account</CardDescription>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Full name"
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="user@example.com"
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone (Optional)
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="+1234567890"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="At least 6 characters"
                    className={formErrors.password ? 'border-red-500' : ''}
                  />
                  {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="complainant">Complainant</option>
                    <option value="staff">Staff</option>
                    <option value="department_manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formErrors.role && <p className="text-xs text-red-500 mt-1">{formErrors.role}</p>}
                </div>

                {/* Department */}
                {(formData.role === 'staff' || formData.role === 'department_manager') && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Department (Optional)
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={formLoading}
                  >
                    {formLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
