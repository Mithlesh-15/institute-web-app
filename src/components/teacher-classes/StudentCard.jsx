import { ArrowRight, Trash2, UserCircle2 } from 'lucide-react'

const getInitials = (name = 'Student') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function StudentCard({ student, onRemove, onViewProfile, removing = false }) {
  const handleRemove = () => {
    if (typeof onRemove === 'function') {
      onRemove(student)
    }
  }

  const handleViewProfile = () => {
    if (typeof onViewProfile === 'function') {
      onViewProfile(student)
    }
  }

  const initials = getInitials(student.name)

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.32))]">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {student.name || 'Unnamed student'}
              </h3>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-brand" />
                <span>Class {student.className || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleViewProfile}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand/25 hover:text-brand"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            View Profile
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {removing ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default StudentCard
