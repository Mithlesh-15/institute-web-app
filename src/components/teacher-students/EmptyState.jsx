import { Users } from 'lucide-react'

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(242,93,13,0.08),rgba(255,217,0,0.12))] text-[#f25d0d]">
        <Users className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

export default EmptyState
