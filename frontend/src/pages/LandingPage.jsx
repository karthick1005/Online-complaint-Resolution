import { motion } from 'framer-motion'
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  FileSearch,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const featureCards = [
  {
    icon: FileSearch,
    title: 'Complaint Tracking',
    description: 'Submit issues with categories, details, and attachments while keeping every update visible.',
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    icon: BellRing,
    title: 'Real-Time Updates',
    description: 'Notify complainants and teams when complaints are assigned, progressed, or resolved.',
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    icon: LayoutDashboard,
    title: 'Role-Based Dashboards',
    description: 'Give citizens, staff, managers, and admins a focused workspace for the next action.',
    accent: 'from-emerald-500 to-teal-600',
  },
]

const stats = [
  { value: '24/7', label: 'Complaint access' },
  { value: '3.4 hrs', label: 'Average response time' },
  { value: '100%', label: 'Trackable workflow' },
]

const processSteps = [
  {
    title: 'Submit with clarity',
    description: 'Users raise issues quickly with the right category, department, and supporting details.',
  },
  {
    title: 'Route to the right team',
    description: 'Managers and staff receive a structured queue instead of scattered calls or messages.',
  },
  {
    title: 'Resolve with transparency',
    description: 'Everyone can follow status changes and resolution history from start to closure.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-hidden selection:bg-blue-500/30">
      <div className="absolute top-[-10%] left-[-8%] h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-[12%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-indigo-500/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-8%] left-[18%] h-[24rem] w-[24rem] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm tracking-wide">CR</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Complaint Resolution</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Online Complaint Portal</p>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white dark:hover:bg-slate-900 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 dark:border-blue-900/60 bg-white/80 dark:bg-slate-900/70 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 backdrop-blur-xl shadow-sm">
              <Sparkles className="h-4 w-4" />
              Modern complaint handling for teams and citizens
            </div>

            <h1 className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02] text-slate-900 dark:text-white">
              Report faster.
              <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                Resolve smarter.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-8 text-slate-600 dark:text-slate-300">
              A clean complaint portal for registering issues, routing them to the correct department,
              and keeping every resolution step visible in one place.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 font-semibold backdrop-blur-xl transition-all hover:-translate-y-0.5"
              >
                Open Dashboard
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.12 + index * 0.08 }}
                  className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl shadow-sm"
                >
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.1 }}
            className="w-full max-w-xl mx-auto"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-slate-800 ring-1 ring-slate-200/50 dark:ring-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Live Overview
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                    Resolution Workspace
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-5 shadow-lg shadow-blue-500/20">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-100">Complaint Queue</p>
                      <p className="mt-1 text-3xl font-bold">128 Active</p>
                    </div>
                    <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                      +18% this week
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden">
                    <div className="h-full w-[72%] rounded-full bg-cyan-300" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/90 dark:bg-slate-950/70 p-5">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <Clock3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <p className="font-medium">Average response</p>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">3.4 hrs</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/90 dark:bg-slate-950/70 p-5">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <p className="font-medium">Resolved this month</p>
                    </div>
                    <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">1,248</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/90 dark:bg-slate-950/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Complaint Timeline
                  </p>
                  <div className="mt-4 space-y-3">
                    {['Submitted', 'Assigned to department', 'In progress', 'Resolved'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            index === 3 ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-400'
                          }`}
                        />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl rounded-3xl p-7 border border-white/20 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
                How it works
              </p>
              <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                One system for reporting, routing, and resolution.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                The landing experience now follows the same visual language as your auth pages and dashboards,
                so users transition naturally from the homepage into the app.
              </p>
            </div>

            <div className="space-y-5">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-slate-800 shadow-lg"
                >
                  <div className="flex gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="mt-2 leading-7 text-slate-600 dark:text-slate-400">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 px-8 py-12 sm:px-12 sm:py-14 text-white shadow-2xl shadow-blue-500/20">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-100">Start using the portal</p>
                <h2 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
                  Keep complaints organized from first report to final resolution.
                </h2>
                <p className="mt-5 max-w-2xl text-base sm:text-lg leading-8 text-blue-50/90">
                  Create an account to submit issues, or sign in to manage queues, assignments, notifications, and analytics.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-white text-blue-700 px-6 py-4 font-semibold transition-all hover:-translate-y-0.5"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-4 font-semibold text-white backdrop-blur transition-all hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
