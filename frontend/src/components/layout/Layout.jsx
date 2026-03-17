import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationDropdown } from './NotificationDropdown'

export default function AppLayout({ children }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) {
    return <div>{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 selection:bg-blue-500/30">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-[280px] min-w-0 transition-all duration-300">
        {/* Mobile & Tablet Header */}
        <header className="sticky top-0 z-20 md:hidden flex items-center justify-between h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                CR
              </div>
              <h1 className="font-semibold text-lg tracking-tight">RapidResolve</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationDropdown />
          </div>
        </header>

        {/* Desktop Topbar */}
        <header className="hidden md:flex sticky top-0 z-20 items-center justify-end h-16 px-8 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200/40 dark:border-slate-800/40">
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex flex-col items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm overflow-hidden text-blue-700 dark:text-blue-300 font-bold text-sm">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 md:px-8 py-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
