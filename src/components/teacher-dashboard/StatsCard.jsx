function StatsCard({ label, value, detail, trend, trendType = 'up', icon }) {
  const Icon = icon

  const trendClass =
    trendType === 'down'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-[#fff8ef] text-[#b84908] border-[#ffd900]/35'

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(242,93,13,0.08),rgba(255,145,0,0.08),rgba(255,217,0,0.06))] p-3 text-[#f25d0d]">
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
