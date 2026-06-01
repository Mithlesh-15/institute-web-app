function StudentStatCard({ label, value, hint, icon: Icon, tone = 'blue' }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-brand',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
          {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span
            className={[
              'flex h-12 w-12 items-center justify-center rounded-2xl',
              toneClasses[tone] || toneClasses.blue,
            ].join(' ')}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default StudentStatCard
