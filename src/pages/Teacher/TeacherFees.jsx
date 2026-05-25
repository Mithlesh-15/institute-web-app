import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleDollarSign, Plus } from 'lucide-react'
import Button from '../../components/ui/Button'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-fees/EmptyState'
import EditPendingModal from '../../components/teacher-fees/EditPendingModal'
import FeeDetailsModal from '../../components/teacher-fees/FeeDetailsModal'
import FeeSummaryCard from '../../components/teacher-fees/FeeSummaryCard'
import SearchBar from '../../components/teacher-fees/SearchBar'
import StudentFeeCard from '../../components/teacher-fees/StudentFeeCard'
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
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPendingOpen, setEditPendingOpen] = useState(false)
  const [editingPendingFee, setEditingPendingFee] = useState(null)
  const [saving, setSaving] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState('')

  const loadFees = async (selectedStudentId = '') => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchFeesOverview()
      setStudents(data)

      if (selectedStudentId) {
        const nextSelected = data.find((student) => student.id === selectedStudentId) || null
        setSelectedStudent(nextSelected)
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load fee records right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFees()
  }, [])

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

  const summary = useMemo(() => {
    const currentMonthStudents = students.filter(Boolean)
    const paidCount = currentMonthStudents.filter(
      (student) => student.currentFee?.status === 'paid',
    ).length
    const pendingCount = currentMonthStudents.filter(
      (student) => student.currentFee?.status !== 'paid',
    ).length
    const totalPendingAmount = currentMonthStudents.reduce(
      (total, student) => total + Number(student.totalPendingAmount || 0),
      0,
    )
    const totalPendingMonths = currentMonthStudents.reduce(
      (total, student) => total + Number(student.totalPendingCount || 0),
      0,
    )

    return {
      totalStudents: currentMonthStudents.length,
      paidCount,
      pendingCount,
      totalPendingAmount,
      totalPendingMonths,
    }
  }, [students])

  const refreshSelectedStudent = async (studentId) => {
    await loadFees(studentId)
  }

  const openStudentDetails = (student) => {
    setSelectedStudent(student)
    setModalOpen(true)
  }

  const closeStudentDetails = () => {
    setModalOpen(false)
    setSelectedStudent(null)
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
      await refreshSelectedStudent(studentId)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save fees right now.',
      )
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
      await refreshSelectedStudent(selectedStudent.id)
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'Unable to mark fee as paid.',
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
      await refreshSelectedStudent(selectedStudent.id)
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

  const statsCards = [
    {
      label: 'Total Students',
      value: summary.totalStudents,
    },
    {
      label: 'Current Month Paid',
      value: summary.paidCount,
    },
    {
      label: 'Current Month Pending',
      value: summary.pendingCount,
    },
    {
      label: 'Pending Months',
      value: summary.totalPendingMonths,
    },
    {
      label: 'Total Pending Amount',
      value: `₹${Number(summary.totalPendingAmount).toLocaleString('en-IN')}`,
      tone: 'text-[#f25d0d]',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(242,93,13,0.06))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <CircleDollarSign className="h-3.5 w-3.5 text-[#2563eb]" />
                Fees management
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Fees
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Track current month payments, manage old pending dues, and update partial payments from one fast workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchBar
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Button variant="secondary" onClick={() => navigate('/teacher/students')}>
                <Plus className="h-4 w-4" />
                View Students
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statsCards.map((card) => (
          <FeeSummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            tone={card.tone || 'text-slate-900'}
          />
        ))}
      </div>

      <SectionCard title="Student fees" subtitle="Current month view">
        <p className="text-sm text-slate-500">
          Current month:{' '}
          <span className="font-semibold text-slate-700">
            {currentMonthYear.month} {currentMonthYear.year}
          </span>
        </p>
      </SectionCard>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
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
            <StudentFeeCard
              key={student.id}
              student={student}
              onClick={openStudentDetails}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No students found"
          description="Try a different student name or phone number."
          onBack={() => navigate('/teacher/students')}
          actionLabel="Back to Students"
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
