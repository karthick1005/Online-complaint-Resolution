import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, AlertCircle } from 'lucide-react'
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { Pagination } from '@/components/ui/Pagination'
import { userAPI } from '@/api'

export default function UsersPage() {
  // ========== State Management ==========
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'complainant',
    departmentId: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)
  
  const { addToast } = useToast()
  const { user: currentUser } = useAuth()
  const itemsPerPage = 10

  // ========== Effects ==========
  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [roleFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter])

  // ========== Data Fetching ==========
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getAllUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined
      })
      setUsers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      addToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await userAPI.getDepartments()
      setDepartments(response.data?.data || [])
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  // ========== Form Validation ==========
  const validateForm = (isEdit = false) => {
    const errors = {}
    
    // Name validation
    if (!formData.name?.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    
    // Email validation
    if (!formData.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    // Password validation
    if (!isEdit && !formData.password) {
      errors.password = 'Password is required'
    } else if (!isEdit && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    } else if (isEdit && formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    // Role validation
    if (!formData.role) {
      errors.role = 'Role is required'
    }
    
    // Department validation (required for staff and department_manager)
    if ((formData.role === 'staff' || formData.role === 'department_manager') && !formData.departmentId) {
      errors.departmentId = 'Department is required for this role'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ========== Form Handlers ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'complainant',
      departmentId: ''
    })
    setFormErrors({})
    setEditingUser(null)
  }

  const handleOpenAddDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      departmentId: user.departmentId || ''
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setTimeout(() => {
      resetForm()
    }, 200) // Wait for dialog close animation
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm(!!editingUser)) {
      return
    }

    try {
      setFormLoading(true)
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        role: formData.role,
      }

      // Add department for staff/department_manager roles
      if (formData.role === 'staff' || formData.role === 'department_manager') {
        userData.departmentId = formData.departmentId || null
      }

      // Add password for new users or if provided for edit
      if (!editingUser) {
        userData.password = formData.password
      } else if (formData.password) {
        userData.password = formData.password
      }

      let response
      if (editingUser) {
        response = await userAPI.updateUser(editingUser.id, userData)
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id ? response.data.user : u
        ))
        addToast('User updated successfully', 'success')
      } else {
        response = await userAPI.createUser(userData)
        setUsers(prev => [response.data.user, ...prev])
        addToast('User created successfully', 'success')
      }

      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save user:', error)
      const errorMessage = error.response?.data?.error || 
        error.response?.data?.message || 
        `Failed to ${editingUser ? 'update' : 'create'} user`
      addToast(errorMessage, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // ========== User Actions ==========
  const handleToggleStatus = async (user) => {
    if (user.id === currentUser?.id) {
      addToast('You cannot change your own status', 'error')
      return
    }

    try {
      const response = await userAPI.toggleUserStatus(user.id)
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, isActive: response.data.user.isActive } : u
      ))
      addToast(
        `User ${response.data.user.isActive ? 'activated' : 'deactivated'} successfully`,
        'success'
      )
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      addToast(error.response?.data?.error || 'Failed to update user status', 'error')
    }
  }

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      addToast('You cannot delete your own account', 'error')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      await userAPI.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      addToast('User deleted successfully', 'success')
    } catch (error) {
      console.error('Failed to delete user:', error)
      addToast(error.response?.data?.error || 'Failed to delete user', 'error')
    }
  }

  // ========== Filtering & Pagination ==========
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // ========== Utility Functions ==========
  const getRoleColor = (role) => {
    const colors = {
      admin: 'destructive',
      department_manager: 'default',
      staff: 'secondary',
      complainant: 'outline'
    }
    return colors[role] || 'outline'
  }

  const formatRole = (role) => {
    return role.replace('_', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId)
    return dept?.name || '—'
  }

  // ========== Render Components ==========
  const renderFormField = (field) => {
    const { type = 'text', name, label, required = false, options, placeholder, hint, disabled = false } = field

    if (type === 'select') {
      return (
        <div key={name}>
          <label className="block text-sm font-medium mb-1.5">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            disabled={disabled || formLoading}
            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {formErrors[name] && (
            <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>{formErrors[name]}</span>
            </div>
          )}
          {hint && !formErrors[name] && (
            <p className="text-xs text-muted-foreground mt-1">{hint}</p>
          )}
        </div>
      )
    }

    return (
      <div key={name}>
        <label className="block text-sm font-medium mb-1.5">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        <Input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled || formLoading}
        />
        {formErrors[name] && (
          <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
            <AlertCircle className="w-3 h-3" />
            <span>{formErrors[name]}</span>
          </div>
        )}
        {hint && !formErrors[name] && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
      </div>
    )
  }

  const renderUserForm = () => {
    const isEdit = !!editingUser
    const requiresDepartment = formData.role === 'staff' || formData.role === 'department_manager'

    const formFields = [
      {
        type: 'text',
        name: 'name',
        label: 'Full Name',
        required: true,
        placeholder: 'John Doe'
      },
      {
        type: 'email',
        name: 'email',
        label: 'Email Address',
        required: true,
        placeholder: 'john@example.com'
      },
      {
        type: 'tel',
        name: 'phone',
        label: 'Phone Number',
        placeholder: '+1234567890'
      },
      {
        type: 'password',
        name: 'password',
        label: 'Password',
        required: !isEdit,
        placeholder: isEdit ? 'Leave blank to keep current password' : 'Minimum 6 characters',
        hint: isEdit ? 'Leave blank to keep current password' : null
      },
      {
        type: 'select',
        name: 'role',
        label: 'Role',
        required: true,
        options: [
          { value: 'complainant', label: 'Complainant' },
          { value: 'staff', label: 'Staff' },
          { value: 'department_manager', label: 'Department Manager' },
          { value: 'admin', label: 'Admin' }
        ]
      }
    ]

    if (requiresDepartment) {
      formFields.push({
        type: 'select',
        name: 'departmentId',
        label: 'Department',
        required: true,
        options: [
          { value: '', label: 'Select Department' },
          ...departments.map(dept => ({
            value: dept.id,
            label: dept.name
          }))
        ]
      })
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {formFields.map(field => renderFormField(field))}
        
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseDialog}
            className="flex-1"
            disabled={formLoading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={formLoading}>
            {formLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              isEdit ? 'Update User' : 'Create User'
            )}
          </Button>
        </div>
      </form>
    )
  }

  const renderUserRow = (user) => (
    <TableRow key={user.id}>
      <TableCell className="font-medium text-sm">{user.name}</TableCell>
      <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
        {user.phone || '—'}
      </TableCell>
      <TableCell>
        <Badge variant={getRoleColor(user.role)} className="text-xs">
          {formatRole(user.role)}
        </Badge>
      </TableCell>
      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
        {(user.role === 'staff' || user.role === 'department_manager') && user.departmentId
          ? getDepartmentName(user.departmentId)
          : '—'}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant={user.isActive ? 'secondary' : 'outline'} className="text-xs">
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <span className="text-lg leading-none">⋯</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenEditDialog(user)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleStatus(user)}
              disabled={user.id === currentUser?.id}
            >
              {user.isActive ? (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            {user.id !== currentUser?.id && (
              <DropdownMenuItem
                onClick={() => handleDeleteUser(user)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  // ========== Main Render ==========
  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Page Header */}
      <div className="px-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          Create, manage, and monitor all system users
        </p>
      </div>

      {/* Action Button - Mobile */}
      <div className="md:hidden flex gap-2">
        <Button onClick={handleOpenAddDialog} className="flex-1 gap-2 h-10 text-sm">
          <Plus className="w-4 h-4" />
          Add New User
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-xs sm:text-sm h-9 sm:h-10"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="department_manager">Dept Manager</option>
              <option value="staff">Staff</option>
              <option value="complainant">Complainant</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-2xl font-bold">
                {filteredUsers.length > 0 
                  ? `Users (${filteredUsers.length})`
                  : 'Users'
                }
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                {filteredUsers.length === users.length 
                  ? `Showing all ${users.length} ${users.length === 1 ? 'user' : 'users'}`
                  : `${filteredUsers.length} of ${users.length} ${users.length === 1 ? 'user' : 'users'}`
                }
              </CardDescription>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 hidden md:flex h-10">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-4 sm:py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : paginatedUsers.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full px-4 sm:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden lg:table-cell">Department</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map(renderUserRow)}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 px-0">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="border border-border rounded-xl p-4 space-y-3 overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                    {/* Top Section: Avatar-like Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate">{user.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant={getRoleColor(user.role)} className="text-xs flex-shrink-0 whitespace-nowrap">
                        {formatRole(user.role).split(' ')[0]}
                      </Badge>
                    </div>
                    
                    {/* Information Section */}
                    <div className="space-y-2 border-t border-border pt-3">
                      {user.phone && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Phone</span>
                          <span className="text-foreground font-medium">{user.phone}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Status</span>
                        <span className={`font-medium ${user.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {(user.role === 'staff' || user.role === 'department_manager') && user.departmentId && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Department</span>
                          <span className="text-foreground font-medium truncate text-right">{getDepartmentName(user.departmentId)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenEditDialog(user)}
                        className="flex-1 text-xs h-9 gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 w-10 p-0 flex-shrink-0">
                            <span className="text-lg leading-none">⋯</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user)}
                            disabled={user.id === currentUser?.id}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          {user.id !== currentUser?.id && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center mt-4">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">No users found</h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-sm mb-4">
                {searchTerm || roleFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first user'
                }
              </p>
              {(searchTerm || roleFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                  }}
                  className="text-xs sm:text-sm h-8 sm:h-9"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto sm:rounded-lg rounded-t-3xl p-4 sm:p-6 gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editingUser 
                ? 'Update user information and permissions'
                : 'Create a new user account with role and permissions'
              }
            </DialogDescription>
          </DialogHeader>
          {renderUserForm()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
