import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Phone, Building, Edit3, Key, Camera } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/ModernCard'
import { ModernButton } from '@/components/ui/ModernButton'
import { useToast } from '@/context/ToastContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department?.name || 'N/A'
  })

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-6 items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account settings and preferences.</p>
        </div>
        <ModernButton icon={Edit3}>Edit Profile</ModernButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 rounded-2xl border-none shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-200/50 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl relative overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 absolute top-0 left-0 right-0" />
          <CardContent className="pt-12 px-6 pb-6 relative z-10 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-600 dark:text-slate-300 overflow-hidden">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">{user?.role}</p>
            
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-6" />
            
            <div className="w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">{user?.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">{profile.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-200/50 dark:ring-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input readOnly value={profile.name} className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm opacity-70 cursor-not-allowed outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input readOnly value={profile.email} className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm opacity-70 cursor-not-allowed outline-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}