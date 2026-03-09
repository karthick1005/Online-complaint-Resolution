import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, FileText, BarChart3, Settings, Users, X, Building2, UserCog, Layers, Shield, UserPlus, LogOut, Bell, Moon, Sun, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const menuItems = {
  admin: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'All Complaints', path: '/complaints' },
    { icon: Building2, label: 'Departments', path: '/admin/departments' },
    { icon: UserCog, label: 'Managers', path: '/admin/managers' },
    { icon: Layers, label: 'Categories', path: '/admin/categories' },
    { icon: Users, label: 'All Users', path: '/users' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ],
  department_manager: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Department Complaints', path: '/complaints' },
    { icon: UserPlus, label: 'Manage Staff', path: '/manager/staff' },
    { icon: Layers, label: 'Categories', path: '/admin/categories' },
    { icon: BarChart3, label: 'Reports', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ],
  staff: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Assigned Complaints', path: '/complaints' },
    { icon: Settings, label: 'Profile', path: '/profile' },
  ],
  complainant: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Complaints', path: '/complaints' },
    { icon: Settings, label: 'Profile', path: '/profile' },
  ],
}

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const items = user ? menuItems[user.role] || menuItems.complainant : []

  const handleNavigation = (path) => {
    navigate(path)
    onClose()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-background border-r border-border shadow-xl transition-transform duration-300 ease-in-out z-40 overflow-y-auto flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 sticky top-0 bg-background border-b border-border p-5 flex items-center justify-between md:justify-start z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Menu
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start gap-4 px-4 py-2.5 h-auto text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted/60 text-foreground hover:translate-x-1'
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground ml-auto" />
                )}
              </Button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-border bg-background p-4 space-y-4">
          {/* System Info */}
          <p className="text-xs text-muted-foreground text-center">
            Complaint Resolution System
          </p>

          {user && (
            <>
              {/* Divider */}
              <div className="h-px bg-border"></div>

              {/* User Profile Card */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-muted/50">
                  <Avatar className="h-10 w-10 border border-border flex-shrink-0">
                    <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-1 h-9"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                  </Button>

                  {/* Theme Toggle */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="flex-1 h-9"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDark ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                  </Button>

                  {/* Profile/Settings Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="flex-1 h-9">
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-background">
                      <DropdownMenuLabel className="font-normal text-xs">
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Profile & Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Logout Button - Mobile */}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full gap-2 h-9 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

