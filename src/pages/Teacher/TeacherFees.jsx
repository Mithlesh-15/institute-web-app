import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-fees/EmptyState'
import EditPendingModal from '../../components/teacher-fees/EditPendingModal'
import FeeDetailsModal from '../../components/teacher-fees/FeeDetailsModal'
import StudentFeeCard from '../../components/teacher-fees/StudentFeeCard'
import SearchBar from '../../components/teacher-students/SearchBar'
import { STUDENT_CLASS_OPTIONS } from '../../utils/studentManagement'
import {
  fetchFeesOverview,
  getCurrentMonthYear,
  markStudentFeePaid,
  saveStudentFeeRecord,
  saveStudentCurrentMonthFee,
} from '../../utils/feesManagement'

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

  const { data: students = [], isLoading: loading, error: queryError } = useQuery({
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

  const handleSaveStudentFee = async ({ studentId, status, pendingAmount }) => {
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
      })
      queryClient.invalidateQueries({ queryKey: ['teacherFeesOverview'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save fees right now.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddNewFee = async ({ studentId, month, year, status, pendingAmount }) => {
    try {
      setSaving(true)
      setError('')
      await saveStudentFeeRecord(studentId, {
        status,
        pendingAmount,
        month,
        year,
      })
      queryClient.invalidateQueries({ queryKey: ['teacherFeesOverview'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to add fee record.')
      throw saveError
    } finally {
      setSaving(false)
    }
  }

  const handleMarkOldFeePaid = async (fee) => {
    if (!selectedStudent) {
      return
    }

    try {
      setActionLoadingId(fee.id)
      setError('')
      await markStudentFeePaid(selectedStudent.id, {
        month: fee.month,
        year: fee.year,
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

  const handleSavePendingEdit = async ({ fee, status, pendingAmount }) => {
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
      })
      closeEditPending()
      queryClient.invalidateQueries({ queryKey: ['teacherFeesOverview'] })
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to update pending fee right now.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
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
    </div>
  )
}

export default TeacherFees
