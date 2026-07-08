import { useRef } from 'react'
import { CalendarDays, PencilLine, Trash2, Clock } from 'lucide-react'

const formatDate = (value) => {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatTime = (value) => {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch (e) {
    return value
  }
}

function ClassCard({ 
  classItem, 
  onEdit, 
  onDelete, 
  onOpen, 
  onContextMenu, 
  onLongPress, 
  deleting = false 
}) {
  const touchTimeout = useRef(null)
  const touchStartPos = useRef({ x: 0, y: 0 })

  const handleOpen = () => {
    if (typeof onOpen === 'function') {
      onOpen(classItem)
    }
  }

  const handleEdit = () => {
    if (typeof onEdit === 'function') {
      onEdit(classItem)
    }
  }

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete(classItem)
    }
  }

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }

    if (touchTimeout.current) clearTimeout(touchTimeout.current)

    touchTimeout.current = setTimeout(() => {
      if (typeof onLongPress === 'function') {
        onLongPress(e, classItem, touch.clientX, touch.clientY)
      }
    }, 600)
  }

  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    const diffX = Math.abs(touch.clientX - touchStartPos.current.x)
    const diffY = Math.abs(touch.clientY - touchStartPos.current.y)

    if (diffX > 10 || diffY > 10) {
      if (touchTimeout.current) {
        clearTimeout(touchTimeout.current)
      }
    }
  }

  const handleTouchEnd = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current)
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    if (typeof onContextMenu === 'function') {
      onContextMenu(e, classItem)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleOpen()
        }
      }}
      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)] select-none"
    >
      <div className="h-1.5 bg-[linear-gradient(90deg,#2563eb,#f25d0d)]" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {classItem.className || 'Unnamed class'}
              </h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {classItem.classLevel || 'N/A'}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {Number.isFinite(classItem.totalStudents)
                  ? `${classItem.totalStudents} students`
                  : '0 students'}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                <span>Starts {formatDate(classItem.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#2563eb]" />
                <span>Time: {formatTime(classItem.classTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                <span>Created {formatDate(classItem.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              handleEdit()
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#2563eb]/25 hover:text-[#2563eb]"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              handleDelete()
            }}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ClassCard
