import { useEffect, useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import Button from '../ui/Button'
import SearchBar from './SearchBar'

function AddStudentsModal({
  open,
  students = [],
  onClose,
  onSubmit,
  loading = false,
}) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelectedIds([])
      setFormError('')
    }
  }, [open])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return students.filter((student) => {
      if (!term) {
        return true
      }

      return (
        student.name.toLowerCase().includes(term) ||
        student.phone.toLowerCase().includes(term)
      )
    })
  }, [search, students])

  const selectedCount = selectedIds.length

  const toggleStudent = (studentId) => {
    setSelectedIds((current) =>
      current.includes(studentId)
        ? current.filter((item) => item !== studentId)
        : [...current, studentId],
    )
  }

  const handleSubmit = async () => {
    if (!selectedIds.length) {
      setFormError('Select at least one student to add.')
      return
    }

    setFormError('')

    try {
      await onSubmit(selectedIds)
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to add students right now.',
      )
    }
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
              Student assignment
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Add Students
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Search by name or phone number, then select students to assign to this class.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-[#2563eb]/20 hover:bg-slate-50 hover:text-[#2563eb]"
            aria-label="Close add students modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students by name or phone..."
            />
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {selectedCount} selected
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
            {filteredStudents.length ? (
              <div className="grid gap-3">
                {filteredStudents.map((student) => {
                  const checked = selectedIds.includes(student.id)

                  return (
                    <label
                      key={student.id}
                      className={[
                        'flex cursor-pointer items-center gap-4 rounded-[1.25rem] border bg-white p-4 transition',
                        checked
                          ? 'border-[#2563eb] shadow-[0_10px_26px_rgba(37,99,235,0.12)]'
                          : 'border-slate-200 hover:border-[#2563eb]/20',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudent(student.id)}
                        className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate font-semibold text-slate-900">
                            {student.name || 'Unnamed student'}
                          </p>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Class {student.className || 'N/A'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{student.phone || 'No phone available'}</p>
                      </div>
                      {checked ? (
                        <Check className="h-5 w-5 text-[#2563eb]" />
                      ) : null}
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
                No students match your search.
              </div>
            )}
          </div>

          {formError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              loading={loading}
              loadingLabel="Adding students..."
            >
              Add Selected Students
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddStudentsModal
