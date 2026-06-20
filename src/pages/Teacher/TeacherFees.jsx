import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-fees/EmptyState'
import EditPendingModal from '../../components/teacher-fees/EditPendingModal'
import FeeDetailsModal from '../../components/teacher-fees/FeeDetailsModal'
import StudentFeeCard from '../../components/teacher-fees/StudentFeeCard'
import SearchBar from '../../components/teacher-students/SearchBar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { STUDENT_CLASS_OPTIONS } from '../../utils/studentManagement'
import {
  fetchFeesOverview,
  getCurrentMonthYear,
  markStudentFeePaid,
  saveStudentFeeRecord,
  saveStudentCurrentMonthFee,
} from '../../utils/feesManagement'
import { exportTeacherMonthlyFeesToExcel, MONTHS } from '../../utils/feesExport'

function ExportFeesReportModal({ open, onClose, onExport, loading }) {
  const [selectedClass, setSelectedClass] = useState('All')
  const [year, setYear] = useState(() => String(new Date().getFullYear()))

  useEffect(() => {
    if (open) {
      setSelectedClass('All')
      setYear(String(new Date().getFullYear()))
    }
  }, [open])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onExport(selectedClass, Number(year))
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = []
  for (let y = 2024; y <= currentYear + 4; y++) {
    yearOptions.push(String(y))
  }

  return (
    <Modal
      open={open}
      title="Export Fees Report"
      description="Choose a class and year to generate the annual fees spreadsheet report."
      onClose={onClose}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Class</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            {STUDENT_CLASS_OPTIONS.map((cName) => (
              <option key={cName} value={cName}>
                {cName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Year</span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} loadingLabel="Generating...">
            Generate
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function TeacherFees() {
  const navigate = useNavigate()
  const currentMonthYear = useMemo(() => getCurrentMonthYear(), [])
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editPendingOpen, setEditPendingOpen] = useState(false)
  const [editingPendingFee, setEditingPendingFee] = useState(null)
  const [saving, setSaving] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type })
    if (type !== 'loading') {
      setTimeout(() => {
        setToast((current) =>
          current.message === message ? { ...current, show: false } : current,
        )
      }, 4000)
    }
  }

  const handleExportReport = async (selectedClass, year) => {
    setExportLoading(true)
    showToast('Generating report...', 'loading')
    try {
      const result = await exportTeacherMonthlyFeesToExcel(selectedClass, year, (msg) => {
        showToast(msg, 'loading')
      })
      if (result.success) {
        showToast('Report generated successfully', 'success')
        setExportModalOpen(false)
      } else if (result.reason === 'NO_DATA') {
        showToast('No data found', 'info')
      } else {
        showToast(result.message || 'Export failed', 'error')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Export failed', 'error')
    } finally {
      setExportLoading(false)
    }
  }

  const { data: students = [], isLoading: loading } = useQuery({
    queryKey: ['teacherFeesOverview'],
    queryFn: fetchFeesOverview,
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
  })

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null
    return students.find((student) => student.id === selectedStudentId) || null
  }, [students, selectedStudentId])

  const classBuckets = useMemo(() => {
    const bucketMap = STUDENT_CLASS_OPTIONS.filter((option) => option !== 'All').reduce(
      (accumulator, className) => {
        accumulator[className] = {
          className,
          totalStudents: 0,
          pendingCount: 0,
          totalPendingAmount: 0,
        }
        return accumulator
      },
      {},
    )

    students.forEach((student) => {
      const bucket = bucketMap[student.className]

      if (!bucket) {
        return
      }

      bucket.totalStudents += 1

      if (student.currentFee?.status !== 'paid') {
        bucket.pendingCount += 1
        bucket.totalPendingAmount += Number(student.currentFee?.pendingAmount || student.totalFees || 0)
      }
    })

    return Object.values(bucketMap)
  }, [students])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    return students.filter((student) => {
      const matchesClass = classFilter === 'All' || student.className === classFilter
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        (student.phone && student.phone.includes(term))
      return matchesClass && matchesSearch
    })
  }, [classFilter, search, students])

  const openStudentDetails = (student) => {
    setSelectedStudentId(student.id)
    setModalOpen(true)
  }

  const closeStudentDetails = () => {
    setModalOpen(false)
    setSelectedStudentId('')
  }

  const handleSaveStudentFee = async ({ studentId, status, pendingAmount, paymentDate }) => {
    if (!selectedStudent) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await saveStudentCurrentMonthFee(studentId, {
        status,
        pendingAmount,
        month: currentMonthYear.month,
        year: currentMonthYear.year,
        paymentDate,
      })
      queryClient.invalidateQueries({ queryKey: ['teacherFeesOverview'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save fees right now.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNewFee = async ({ studentId, month, year, status, pendingAmount, paymentDate }) => {
    try {
      setSaving(true)
      setError('')
      await saveStudentFeeRecord(studentId, {
        status,
        pendingAmount,
        month,
        year,
        paymentDate,
      })
      queryClient.invalidateQueries({ queryKey: ['teacherFeesOverview'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to add fee record.')
      throw saveError
    } finally {
      setSaving(false)
    }
  }

  const handleMarkOldFeePaid = async (fee, paymentDate) => {
    if (!selectedStudent) {
      return
    }

    try {
      setActionLoadingId(fee.id)
      setError('')
      await markStudentFeePaid(selectedStudent.id, {
        month: fee.month,
        year: fee.year,
        paymentDate,
      })
      queryClient.invalidateQueries({ queryKey: ['teacherFeesOverview'] })
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'Unable to mark fee as paid.',
      )
    } finally {
      setActionLoadingId('')
    }
  }

  const openEditPending = (fee) => {
    setEditingPendingFee(fee)
    setEditPendingOpen(true)
  }

  const closeEditPending = () => {
    setEditPendingOpen(false)
    setEditingPendingFee(null)
  }

  const handleSavePendingEdit = async ({ fee, status, pendingAmount, paymentDate }) => {
    if (!selectedStudent) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await saveStudentFeeRecord(selectedStudent.id, {
        status,
        pendingAmount,
        month: fee.month,
        year: fee.year,
        paymentDate,
      })
      queryClient.invalidateQueries({ queryKey: ['teacherFeesOverview'] })
      closeEditPending()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to update pending fee right now.',
      )
      throw saveError
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Fees Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track student fees, record payments, and download monthly statements.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:w-auto">
            <Button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Fees Report
            </Button>
          </div>
        </div>
      </section>

      <SectionCard title="Fees" subtitle="Class wise categories">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setClassFilter('All')}
            className={[
              'rounded-xl border p-2.5 text-left transition-all duration-300',
              classFilter === 'All'
                ? 'border-brand bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.92))] text-white shadow-soft'
                : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-surface',
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <span className={[
                'text-xs font-bold uppercase tracking-wider',
                classFilter === 'All' ? 'text-white' : 'text-slate-700',
              ].join(' ')}>
                All
              </span>
              <span className={[
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                classFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
              ].join(' ')}>
                {students.length} st
              </span>
            </div>
            <p className={classFilter === 'All' ? 'mt-2.5 text-[11px] text-white/80' : 'mt-2.5 text-[11px] text-slate-500'}>
              All student fee records
            </p>
          </button>

          {classBuckets.map((bucket) => (
            <button
              key={bucket.className}
              type="button"
              onClick={() => setClassFilter(bucket.className)}
              className={[
                'rounded-xl border p-2.5 text-left transition-all duration-300',
                classFilter === bucket.className
                  ? 'border-brand bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.92))] text-white shadow-soft'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-surface',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className={[
                  'text-xs font-bold uppercase tracking-wider',
                  classFilter === bucket.className ? 'text-white' : 'text-slate-700',
                ].join(' ')}>
                  {bucket.className}
                </span>
                <span className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  classFilter === bucket.className ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
                ].join(' ')}>
                  {bucket.totalStudents} st
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium">
                <span className={classFilter === bucket.className ? 'text-white/80' : 'text-slate-500'}>
                  {bucket.pendingCount} pending
                </span>
                <span className={classFilter === bucket.className ? 'text-white' : 'text-[#f25d0d]'}>
                  ₹{Number(bucket.totalPendingAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SearchBar
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search students by name or phone..."
        />
      </SectionCard>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft sm:h-64"
            />
          ))}
        </div>
      ) : error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : filteredStudents.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentFeeCard key={student.id} student={student} onClick={openStudentDetails} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No students found"
          description={students.length ? 'Try a different search term or class filter.' : 'Try a different class category.'}
          onBack={search ? () => setSearch('') : () => navigate('/teacher/students')}
          actionLabel={search ? 'Reset Search' : 'Back to Students'}
        />
      )}

      <FeeDetailsModal
        open={modalOpen}
        student={selectedStudent}
        currentMonthYear={currentMonthYear}
        loading={saving}
        actionLoadingId={actionLoadingId}
        onClose={closeStudentDetails}
        onSave={handleSaveStudentFee}
        onMarkPaid={handleMarkOldFeePaid}
        onEditPending={openEditPending}
        onAddFee={handleAddNewFee}
      />

      <EditPendingModal
        open={editPendingOpen}
        fee={editingPendingFee}
        loading={saving}
        onClose={closeEditPending}
        onSave={handleSavePendingEdit}
      />

      <ExportFeesReportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportReport}
        loading={exportLoading}
      />

      {toast.show && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.15)] transition-all duration-300">
          {toast.type === 'loading' && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2563eb]/40 border-t-[#2563eb]" />
          )}
          {toast.type === 'success' && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">✓</span>
          )}
          {toast.type === 'error' && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">!</span>
          )}
          {toast.type === 'info' && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">i</span>
          )}
          <span className="text-sm font-semibold text-slate-800">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default TeacherFees
