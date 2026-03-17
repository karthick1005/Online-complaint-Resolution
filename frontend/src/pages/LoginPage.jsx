import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, AlertCircle, UserPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ModernButton } from '@/components/ui/ModernButton'
import { useToast } from '@/context/ToastContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      addToast('Login successful!', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'admin@complaintresolution.com', password: 'Admin@123', role: 'Admin', color: 'from-purple-500 to-pink-600' },
    { email: 'manager.infra@complaintresolution.com', password: 'Manager@123', role: 'Manager', color: 'from-cyan-500 to-blue-600' },
    { email: 'staff.infra@complaintresolution.com', password: 'Staff@123', role: 'Staff', color: 'from-emerald-500 to-teal-600' },
    { email: 'user1@example.com', password: 'User@123', role: 'User', color: 'from-blue-500 to-indigo-600' },
  ]

  const useDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500/30">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-800 ring-1 ring-slate-200/50 dark:ring-slate-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <span className="text-2xl font-black text-white">CR</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to manage your workspace.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 mb-6 border border-red-100 dark:border-red-900/50"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 text-slate-500 transition-colors">
              <label className="text-xs font-semibold uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all sm:text-sm shadow-inner"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:text-blue-600 dark:focus-within:text-blue-400 text-slate-500 transition-colors">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">Forgot?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all sm:text-sm shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <ModernButton
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base mt-2"
              icon={LogIn}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </ModernButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="btn btn-secondary w-full hover-lift"
          >
            <UserPlus className="w-5 h-5" />
            Create Account
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="modern-card p-6 animate-slideIn" style={{ animationDelay: '100ms' }}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Demo Accounts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click any account to auto-fill credentials
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {demoAccounts.map((account, index) => (
              <button
                key={account.email}
                onClick={() => useDemoCredentials(account.email, account.password)}
                className="relative p-4 rounded-xl text-white hover:scale-105 transition-transform shadow-md hover:shadow-lg text-left group overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
                title={`${account.email} / ${account.password}`}
              >
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${account.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                <div className="relative z-10">
                  <p className="font-semibold mb-1">{account.role}</p>
                  <p className="text-xs opacity-90 truncate">{account.email.split('@')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}