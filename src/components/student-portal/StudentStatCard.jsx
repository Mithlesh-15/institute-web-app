function StudentStatCard({ label, value, hint, icon: Icon, tone = 'blue' }) {
  const toneClasses = {
    blue: {
      bg: 'bg-linear-to-br from-blue-50/60 to-white border-blue-100/60',
      icon: 'bg-blue-50 text-brand border border-blue-200/40',
    },
    amber: {
      bg: 'bg-linear-to-br from-amber-50/60 to-white border-amber-100/60',
      icon: 'bg-amber-50 text-amber-600 border border-amber-200/40',
    },
    violet: {
      bg: 'bg-linear-to-br from-violet-50/60 to-white border-violet-100/60',
      icon: 'bg-violet-50 text-violet-600 border border-violet-200/40',
    },
    emerald: {
      bg: 'bg-linear-to-br from-emerald-50/60 to-white border-emerald-100/60',
      icon: 'bg-emerald-50 text-emerald-600 border border-emerald-200/40',
    },
  }

  const currentTone = toneClasses[tone] || toneClasses.blue

  return (
    <div className={`rounded-3xl border p-5 shadow-soft transition-all duration-300 hover:scale-[1.01] hover:shadow-md ${currentTone.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
          {hint ? <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${currentTone.icon}`}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default StudentStatCard
