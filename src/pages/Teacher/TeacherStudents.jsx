import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-students/EmptyState'
import FilterTabs from '../../components/teacher-students/FilterTabs'
import SearchBar from '../../components/teacher-students/SearchBar'
import StudentCard from '../../components/teacher-students/StudentCard'
import StudentProfileModal from '../../components/teacher-students/StudentProfileModal'
import { STUDENT_CLASS_OPTIONS, deleteStudentById, fetchStudents } from '../../utils/studentManagement'
import { fetchStudentDetail, updateStudentFees, updateStudentProfile } from '../../utils/teacherPortal'

function TeacherStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [deletingId, setDeletingId] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingFees, setSavingFees] = useState(false)
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchStudents()
      setStudents(data)
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : 'Unable to load students right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesClass = classFilter === 'All' || student.className === classFilter
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.phone.toLowerCase().includes(term) ||
        (student.subjects || []).some((subject) => subject.toLowerCase().includes(term))

      return matchesClass && matchesSearch
    })
  }, [classFilter, search, students])

  const openProfile = async (student) => {
    setSelectedStudentId(student.id)
    setProfileOpen(true)
    setProfileLoading(true)
    setError('')

    try {
      const detail = await fetchStudentDetail(student.id)
      setSelectedStudentDetail(detail)
    } catch (profileError) {
      setError(
        profileError instanceof Error ? profileError.message : 'Unable to load student profile.',
      )
      setSelectedStudentDetail({
        student,
        classes: [],
        attendance: {
          totalPresent: 0,
          totalAbsent: 0,
          attendancePercentage: 0,
          totalCount: 0,
        },
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const closeProfile = () => {
    setProfileOpen(false)
    setSelectedStudentDetail(null)
    setSelectedStudentId('')
    setProfileLoading(false)
    setSavingProfile(false)
    setSavingFees(false)
  }

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(`Delete ${student.name || 'this student'}? This cannot be undone.`)

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(student.id)
      setError('')
      await deleteStudentById(student.id)
      setStudents((current) => current.filter((item) => item.id !== student.id))
      if (selectedStudentId === student.id) {
        closeProfile()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete student right now.')
    } finally {
      setDeletingId('')
    }
  }

  const refreshStudentDetail = async () => {
    if (!selectedStudentId) {
      return
    }

    const detail = await fetchStudentDetail(selectedStudentId)
    setSelectedStudentDetail(detail)
    setStudents((current) =>
      current.map((student) =>
        student.id === detail.student.id
          ? {
              ...student,
              ...detail.student,
            }
          : student,
      ),
    )
  }

  const handleSaveProfile = async ({ name, className, subjects }) => {
    if (!selectedStudentId) {
      return
    }

    try {
      setSavingProfile(true)
      setError('')
      await updateStudentProfile(selectedStudentId, { name, className, subjects })
      await refreshStudentDetail()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save student details.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveFees = async ({ totalFees }) => {
    if (!selectedStudentId) {
      return
    }

    try {
      setSavingFees(true)
      setError('')
      await updateStudentFees(selectedStudentId, totalFees)
      await refreshStudentDetail()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save fee settings.')
    } finally {
      setSavingFees(false)
    }
  }

  const totalStudents = students.length

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <Users className="h-3.5 w-3.5 text-[#2563eb]" />
                Raj Tuition Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Students
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Keep learner cards fast to scan, then open a compact profile for details, attendance, and fees.
              </p>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total Students</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{totalStudents}</p>
            </div>
          </div>
        </div>
      </section>

      <SectionCard>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Search by name, phone, class, or subject.
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Click a card to view and edit a full profile.
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <SearchBar value={search} onChange={(event) => setSearch(event.target.value)} />
          <FilterTabs value={classFilter} options={STUDENT_CLASS_OPTIONS} onChange={setClassFilter} />
        </div>
      </SectionCard>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
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
            <StudentCard
              key={student.id}
              student={student}
              deleting={deletingId === student.id}
              onViewProfile={openProfile}
              onDelete={handleDeleteStudent}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No students found" description="Try a different search term or class filter." />
      )}

      <StudentProfileModal
        open={profileOpen}
        studentDetail={selectedStudentDetail}
        loading={profileLoading}
        savingProfile={savingProfile}
        savingFees={savingFees}
        onClose={closeProfile}
        onSaveProfile={handleSaveProfile}
        onSaveFees={handleSaveFees}
      />
    </div>
  )
}

export default TeacherStudents
