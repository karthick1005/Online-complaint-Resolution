import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, Mail, Lock, UserPlus } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      addToast('Login successful!', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Please try again.', 'error')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12 animate-fadeIn">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4 animate-scaleIn">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to manage your complaints
          </p>
        </div>

        {/* Login Form Card */}
        <div className="modern-card p-8 mb-6 animate-slideIn">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="modern-input pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="modern-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg hover-lift"
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
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

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Need help?{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
