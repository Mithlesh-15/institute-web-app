import { Users } from 'lucide-react'

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-soft">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.28))] text-[#2563eb]">
        <Users className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

export default EmptyState
