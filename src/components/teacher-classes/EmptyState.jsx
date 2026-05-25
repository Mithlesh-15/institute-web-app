import { GraduationCap, Plus } from 'lucide-react'
import Button from '../ui/Button'

function EmptyState({ title, description, onCreate, actionLabel = 'Create Class' }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-soft">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(242,93,13,0.12))] text-[#2563eb]">
        <GraduationCap className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {typeof onCreate === 'function' ? (
        <div className="mt-6">
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default EmptyState
