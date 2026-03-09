import { useState, useEffect } from "react"
import { Users, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { userAPI } from "@/api"
import { useAuth } from "@/context/AuthContext"

export default function StaffDashboard() {
  const { user } = useAuth()

  const [staffs, setStaffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        setLoading(true)

        const params = {}
        if (filterRole !== "all") params.role = filterRole

        const response = await userAPI.getAllUsers(params)
        setStaffs(response.data.data || [])
      } catch (error) {
        console.error("Error fetching staffs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStaffs()
  }, [filterRole])

  const filteredStaffs = staffs.filter((staff) => {
    return (
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.phone && staff.phone.includes(searchTerm))
    )
  })

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: "critical",
      department_manager: "high",
      staff: "medium",
      complainant: "low"
    }
    return colors[role] || "default"
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-2">
          <Users className="w-7 h-7" />
          Staff Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and view department staff members
        </p>
      </div>

      {/* Staff Count Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffs.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active department users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Department Staff</CardTitle>
          <CardDescription>
            List of staff members in your department
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-background"
            >
              <option value="all">All Roles</option>
              <option value="staff">Staff</option>
              <option value="department_manager">Department Manager</option>
              <option value="complainant">Citizen</option>
            </select>
          </div>

          {/* Table */}
          {filteredStaffs.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredStaffs.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium text-sm">
                        {staff.name}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-sm">{staff.email}</TableCell>

                      <TableCell className="hidden md:table-cell text-sm">
                        {staff.phone || "—"}
                      </TableCell>

                      <TableCell>
                        <Badge variant={getRoleColor(staff.role)} className="text-xs">
                          {staff.role.replace("_", " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-sm">
                        {staff.department?.name || "—"}
                      </TableCell>

                      <TableCell>
                        <Badge variant={staff.isActive ? "resolved" : "closed"} className="text-xs">
                          {staff.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                        {formatDate(staff.createdAt)}
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
                {searchTerm
                  ? "No staff found matching your search"
                  : "No staff members available"}
              </p>
            </div>
          )}

          {/* Footer Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredStaffs.length} of {staffs.length} staff members
          </div>
        </CardContent>
      </Card>
    </div>
  )
}