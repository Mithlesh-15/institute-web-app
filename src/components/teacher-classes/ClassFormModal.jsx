import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
const initialFormState = {
  className: '',
  classLevel: '6th',
  startDate: '',
  classTime: '',
}

const extractHHMM = (isoString) => {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return ''
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  } catch (e) {
    return ''
  }
}

function ClassFormModal({
  open,
  initialValues,
  isEditing = false,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] = useState(initialFormState)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    setFormData({
      className: initialValues?.className || '',
      classLevel: initialValues?.classLevel || '6th',
      startDate: initialValues?.startDate || '',
      classTime: extractHHMM(initialValues?.classTime) || '',
    })
    setFormError('')
  }, [initialValues, open])

  useEffect(() => {
    if (!open) {
      setFormError('')
    }
  }, [open])

  if (!open) {
    return null
  }

  const handleChange = (field) => (event) => {
    setFormData((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedName = formData.className.trim()
    const trimmedLevel = formData.classLevel.trim()
    const trimmedStartDate = formData.startDate.trim()

    if (!trimmedName) {
      setFormError('Please enter a class name.')
      return
    }

    if (!trimmedLevel) {
      setFormError('Please select a class.')
      return
    }

    if (!trimmedStartDate) {
      setFormError('Please select a start date.')
      return
    }

    setFormError('')
    try {
      await onSubmit({
        className: trimmedName,
        classLevel: trimmedLevel,
        startDate: trimmedStartDate,
        classTime: formData.classTime.trim(),
      })
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to save class right now.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
              Batch details
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {isEditing ? 'Edit class' : 'Create class'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Save a batch with a class name, class level, and start date.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-[#2563eb]/20 hover:bg-slate-50 hover:text-[#2563eb]"
            aria-label="Close class form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <Input
            label="Class Name"
            id="className"
            value={formData.className}
            onChange={handleChange('className')}
            placeholder="Enter class name"
            autoComplete="off"
            disabled={loading}
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Class</span>
            <select
              value={formData.classLevel}
              onChange={handleChange('classLevel')}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              {['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Start Date</span>
            <input
              type="date"
              value={formData.startDate}
              onChange={handleChange('startDate')}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Class Time</span>
            <input
              type="time"
              value={formData.classTime}
              onChange={handleChange('classTime')}
              disabled={loading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>

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
              type="submit"
              loading={loading}
              loadingLabel={isEditing ? 'Saving changes...' : 'Creating class...'}
            >
              {isEditing ? 'Save Changes' : 'Create Class'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClassFormModal
