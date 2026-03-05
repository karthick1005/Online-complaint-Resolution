import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/context/AuthContext'

export default function AppLayout({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <div>{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
