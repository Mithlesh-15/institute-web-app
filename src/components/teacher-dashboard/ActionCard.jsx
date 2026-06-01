import { Link } from 'react-router-dom'

function ActionCard({ to, label, description, icon }) {
  const Icon = icon

  return (
    <Link
      to={to}
      className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]"
    >
      <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.08))] p-3 text-brand transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </Link>
  )
}

export default ActionCard
