import { Eye, Trash2, School2, CalendarDays } from 'lucide-react'

function getInitials(name = 'Student') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const formatAdmissionDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StudentCard({ student, onDelete, onViewProfile, deleting = false }) {
  const initials = getInitials(student.name)

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(student)
    }
  }

  const handleViewProfile = () => {
    if (typeof onViewProfile === 'function') {
      onViewProfile(student)
    }
  }

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.28))]">
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
              <h3 className="truncate text-lg font-semibold text-slate-900">{student.name || 'Unnamed student'}</h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Active
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <School2 className="h-4 w-4 text-brand" />
                <span>Class {student.className || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-brand" />
                <span>Admission Date: {formatAdmissionDate(student.createdAt)}</span>
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
            <Eye className="h-3.5 w-3.5" />
            View Profile
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default StudentCard
