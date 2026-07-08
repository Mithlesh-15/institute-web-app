import { Link } from 'react-router-dom'

function ActionCard({ to, label, description, icon }) {
  const Icon = icon

  // Map labels to custom gradient combinations for a colorful experience
  const labelThemes = {
    Classes: {
      gradient: 'from-emerald-50/70 via-teal-50/20 to-white hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
      iconHover: 'group-hover:text-emerald-700',
    },
    Students: {
      gradient: 'from-blue-50/70 via-indigo-50/20 to-white hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/50',
      iconHover: 'group-hover:text-blue-700',
    },
    Attendance: {
      gradient: 'from-purple-50/70 via-indigo-50/20 to-white hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100/50',
      iconHover: 'group-hover:text-purple-700',
    },
    Fees: {
      gradient: 'from-amber-50/70 via-orange-50/20 to-white hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100/50',
      iconHover: 'group-hover:text-amber-700',
    },
    Results: {
      gradient: 'from-pink-50/70 via-rose-50/20 to-white hover:border-pink-300',
      iconBg: 'bg-pink-50 text-pink-600 border border-pink-100/50',
      iconHover: 'group-hover:text-pink-700',
    },
    Notices: {
      gradient: 'from-cyan-50/70 via-teal-50/20 to-white hover:border-cyan-300',
      iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-100/50',
      iconHover: 'group-hover:text-cyan-700',
    },
    Library: {
      gradient: 'from-violet-50/70 via-purple-50/20 to-white hover:border-violet-300',
      iconBg: 'bg-violet-50 text-violet-600 border border-violet-100/50',
      iconHover: 'group-hover:text-violet-700',
    },
  }

  const defaultTheme = {
    gradient: 'from-slate-50/70 to-white hover:border-brand/25',
    iconBg: 'bg-blue-50 text-brand border border-blue-100/50',
    iconHover: 'group-hover:text-brand-strong',
  }

  const theme = labelThemes[label] || defaultTheme

  return (
    <Link
      to={to}
      className={`group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-linear-to-br ${theme.gradient} p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]`}
    >
      <div className={`rounded-2xl ${theme.iconBg} p-3 transition-transform duration-300 group-hover:scale-105 shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-800">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </Link>
  )
}

export default ActionCard
