import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Menu } from 'lucide-react'

export default function AppLayout({ children }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return <div>{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-72">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden flex items-center gap-4 h-16 px-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Complaint Resolution</h1>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
