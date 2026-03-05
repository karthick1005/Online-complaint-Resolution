import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Home, FileText, BarChart3, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

const menuItems = {
  admin: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'All Complaints', path: '/complaints' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ],
  department_manager: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Department Complaints', path: '/complaints' },
    { icon: Users, label: 'Staff', path: '/staff' },
    { icon: BarChart3, label: 'Reports', path: '/analytics' },
  ],
  staff: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Assigned Complaints', path: '/complaints' },
  ],
  complainant: [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'My Complaints', path: '/complaints' },
  ],
}

export function Sidebar() {
  const [open, setOpen] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const items = user ? menuItems[user.role] || menuItems.complainant : []

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 md:hidden z-30"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-20" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-card border-r border-border transition-transform duration-300 z-30 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Menu</h2>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className="w-full justify-start gap-3 transition-smooth"
                onClick={() => {
                  navigate(item.path)
                  setOpen(false)
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
