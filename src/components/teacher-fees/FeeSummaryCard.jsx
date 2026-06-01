function FeeSummaryCard({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-soft">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</p>
    </div>
  )
}

export default FeeSummaryCard
