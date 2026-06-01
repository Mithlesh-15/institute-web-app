function StatsCard({ label, value, detail, trend, trendType = 'up', icon }) {
  const Icon = icon

  const trendClass =
    trendType === 'down'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-blue-50 text-blue-700 border-blue-100'

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.08),rgba(219,234,254,0.8))] p-3 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${trendClass}`}>
          {trend}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  )
}

export default StatsCard
