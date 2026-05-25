import { useEffect, useMemo, useState } from 'react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-fees/EmptyState'
import EditPendingModal from '../../components/teacher-fees/EditPendingModal'
import FeeDetailsModal from '../../components/teacher-fees/FeeDetailsModal'
import SearchBar from '../../components/teacher-fees/SearchBar'
import StudentFeeCard from '../../components/teacher-fees/StudentFeeCard'
import {
  fetchFeesOverview,
  getCurrentMonthYear,
  markStudentFeePaid,
  saveStudentFeeRecord,
  saveStudentCurrentMonthFee,
} from '../../utils/feesManagement'

const CLASS_FILTER_OPTIONS = ['All', '9th', '10th', '11th', '12th', 'Others']

const getStudentClassGroup = (className) => {
  const normalized = String(className || '').trim().toLowerCase()

  if (normalized === '9th') return '9th'
  if (normalized === '10th') return '10th'
  if (normalized === '11th') return '11th'
  if (normalized === '12th') return '12th'
  return 'Others'
}

function TeacherFees() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPendingOpen, setEditPendingOpen] = useState(false)
  const [editingPendingFee, setEditingPendingFee] = useState(null)
  const [saving, setSaving] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState('')

  const currentMonthYear = useMemo(() => getCurrentMonthYear(), [])

  const currentMonthPendingCount = useMemo(
    () => students.filter((student) => student.currentFee?.status === 'pending').length,
    [students],
  )

  const loadFees = async (selectedStudentId = '') => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchFeesOverview()
      setStudents(data)

      if (selectedStudentId) {
        const matchedStudent = data.find((student) => student.id === selectedStudentId)
        if (matchedStudent) {
          setSelectedStudent(matchedStudent)
        }
      } else if (selectedStudent) {
        const matchedStudent = data.find((student) => student.id === selectedStudent.id)
        if (matchedStudent) {
          setSelectedStudent(matchedStudent)
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load fees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesSearch =
        !normalizedSearch ||
        student.name?.toLowerCase().includes(normalizedSearch) ||
        student.phone?.toLowerCase().includes(normalizedSearch)

      const matchesClassFilter =
        classFilter === 'All' ? true : getStudentClassGroup(student.className) === classFilter

      return matchesSearch && matchesClassFilter
    })
  }, [classFilter, search, students])

  const openStudent = (student) => {
    setSelectedStudent(student)
    setModalOpen(true)
  }

  const closeStudent = () => {
    setModalOpen(false)
  }

  const refreshSelectedStudent = (nextStudent) => {
    if (!nextStudent) {
      return
    }

    setSelectedStudent(nextStudent)
    setStudents((current) =>
      current.map((student) => (student.id === nextStudent.id ? nextStudent : student)),
    )
  }

  const handleSaveStudentFee = async ({ studentId, status, pendingAmount }) => {
    if (!selectedStudent || selectedStudent.id !== studentId) {
      return
    }

    try {
      setSaving(true)
      const updatedFee = await saveStudentCurrentMonthFee(studentId, {
        status,
        pendingAmount,
        month: currentMonthYear.month,
        year: currentMonthYear.year,
      })

      const nextStudent = {
        ...selectedStudent,
        currentFee: updatedFee,
      }

      refreshSelectedStudent(nextStudent)
      await loadFees(studentId)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save fees.')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkOldFeePaid = async (fee) => {
    if (!selectedStudent || !fee?.studentId) {
      return
    }

    try {
      setActionLoadingId(fee.id)
      const updatedFee = await markStudentFeePaid(fee.studentId, {
        month: fee.month,
        year: fee.year,
      })

      const nextStudent = {
        ...selectedStudent,
        previousPendingFees: selectedStudent.previousPendingFees
          .map((item) => (item.id === fee.id ? updatedFee : item))
          .filter(Boolean),
      }

      refreshSelectedStudent(nextStudent)
      await loadFees(selectedStudent.id)
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Unable to update fee.')
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
    if (!selectedStudent || !fee?.studentId) {
      return
    }

    try {
      setActionLoadingId(fee.id)
      const updatedFee = await saveStudentFeeRecord(fee.studentId, {
        status,
        pendingAmount,
        month: fee.month,
        year: fee.year,
        paymentDate: fee.paymentDate,
      })

      const nextStudent = {
        ...selectedStudent,
        previousPendingFees: selectedStudent.previousPendingFees
          .map((item) => (item.id === fee.id ? updatedFee : item))
          .filter(Boolean),
      }

      refreshSelectedStudent(nextStudent)
      closeEditPending()
      await loadFees(selectedStudent.id)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update fee.')
    } finally {
      setActionLoadingId('')
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Fees"
        action={
          <div className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-[#ef4444]">
            Pending {currentMonthPendingCount}
          </div>
        }
      >
        <SearchBar value={search} onChange={(event) => setSearch(event.target.value)} />
      </SectionCard>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CLASS_FILTER_OPTIONS.map((option) => {
            const active = classFilter === option

            return (
              <button
                key={option}
                type="button"
                onClick={() => setClassFilter(option)}
                className={[
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition',
                  active
                    ? 'bg-[#2563eb] text-white shadow-[0_10px_24px_rgba(37,99,235,0.2)]'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#2563eb]/20 hover:text-[#2563eb]',
                ].join(' ')}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-soft">
          {error}
        </div>
      ) : null}

      {filteredStudents.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentFeeCard key={student.id} student={student} onClick={openStudent} />
          ))}
        </div>
      ) : (
        <EmptyState title="No students found" />
      )}

      <FeeDetailsModal
        open={modalOpen}
        student={selectedStudent}
        currentMonthYear={currentMonthYear}
        onClose={closeStudent}
        onSave={handleSaveStudentFee}
        onMarkPaid={handleMarkOldFeePaid}
        onEditPending={openEditPending}
        loading={saving}
        actionLoadingId={actionLoadingId}
      />

      <EditPendingModal
        open={editPendingOpen}
        fee={editingPendingFee}
        onClose={closeEditPending}
        onSave={handleSavePendingEdit}
        loading={actionLoadingId === editingPendingFee?.id}
      />
    </div>
  )
}

export default TeacherFees
