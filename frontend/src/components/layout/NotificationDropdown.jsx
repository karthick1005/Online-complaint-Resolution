import { useState, useEffect } from 'react'
import { Bell, Check, BellOff, Info, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Button } from '@/components/ui/Button'
import { notificationAPI } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

const typeIcons = {
  complaint_update: AlertTriangle,
  assignment: CheckCircle2,
  resolution: Check,
  comment: MessageSquare,
  system: Info
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await notificationAPI.getNotifications?.({ limit: 10 }).catch(() => ({ data: [] }))
      const notifs = Array.isArray(data) ? data : data?.data || []
      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.isRead)?.length || 0)
    } catch (err) {
      console.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id, e) => {
    e?.stopPropagation()
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      await notificationAPI.markAsRead?.(id).catch(() => {})
    } catch (err) {
      console.error('Failed to mark read', err)
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markAsRead(notification.id)
    setIsOpen(false)
    const refId = notification.referenceId || notification.refId
    const refType = notification.referenceType || notification.refType
    if (refId && (refType === 'Complaint' || refType === 'complaint')) {
      navigate(`/complaints/${refId}`)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative w-10 h-10 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors ring-1 ring-slate-200/50 dark:ring-slate-800/50 focus:outline-none cursor-pointer border-none">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_0_2px_white] dark:shadow-[0_0_0_2px_#0f172a]"
              />
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[320px] sm:w-[380px] p-0 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 mt-2">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 rounded-t-2xl">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h3>
            <p className="text-xs text-slate-500 mt-0.5">You have {unreadCount} unread messages</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => {/* mark all as read */}}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
          {loading ? (
            <div className="py-8 text-center text-slate-500 text-sm flex flex-col items-center">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mb-2" />
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <BellOff className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">Check back later for new updates.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <AnimatePresence initial={false}>
                {notifications.map((notification) => {
                  const Icon = typeIcons[notification.type] || Info
                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "relative p-4 border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group",
                        !notification.isRead && "bg-blue-50/30 dark:bg-blue-900/10"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-1",
                          !notification.isRead ? "bg-blue-100 ring-blue-200 text-blue-600 dark:bg-blue-900/50 dark:ring-blue-800 dark:text-blue-400" : "bg-slate-100 ring-slate-200 text-slate-500 dark:bg-slate-800 dark:ring-slate-700 dark:text-slate-400"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <p className={cn("text-sm mb-1 line-clamp-2", !notification.isRead ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300")}>
                            {notification.message}
                          </p>
                          <span className="text-xs text-slate-400">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={(e) => markAsRead(notification.id, e)}
                            className="absolute top-4 right-4 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {!notification.isRead && (
                          <div className="absolute top-[22px] right-[22px] w-2 h-2 bg-blue-500 rounded-full group-hover:opacity-0 transition-opacity" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
