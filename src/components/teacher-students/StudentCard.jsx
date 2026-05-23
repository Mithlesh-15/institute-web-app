import { Eye, Trash2, Phone, School2 } from 'lucide-react'

function getInitials(name = 'Student') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StudentCard({ student, onDelete, deleting = false }) {
  const initials = getInitials(student.name)

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(student)
    }
  }

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(242,93,13,0.08),rgba(255,217,0,0.12))]">
            {student.photo ? (
              <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#b84908]">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-slate-900">{student.name || 'Unnamed student'}</h3>
              <span className="rounded-full bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-[#9a3d07]">
                Active
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <School2 className="h-4 w-4 text-[#f25d0d]" />
                <span>Class {student.className || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#f25d0d]" />
                <span>{student.phone || 'No phone available'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(student.subjects || []).length ? (
            student.subjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full border border-[#ffd900]/35 bg-[#fff8ef] px-3 py-1 text-xs font-medium text-[#9a3d07]"
              >
                {subject}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              No subjects added
            </span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#f25d0d]/25 hover:text-[#f25d0d]"
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
