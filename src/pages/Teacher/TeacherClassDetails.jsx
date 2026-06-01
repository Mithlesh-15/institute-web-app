import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Plus, PencilLine } from 'lucide-react'
import Button from '../../components/ui/Button'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import AddStudentsModal from '../../components/teacher-classes/AddStudentsModal'
import EmptyState from '../../components/teacher-classes/EmptyState'
import SearchBar from '../../components/teacher-classes/SearchBar'
import StudentCard from '../../components/teacher-classes/StudentCard'
import ClassFormModal from '../../components/teacher-classes/ClassFormModal'
import {
  addStudentsToClass,
  fetchAvailableStudentsForClass,
  fetchClassById,
  fetchClassStudents,
  removeStudentFromClass,
  updateClassRecord,
} from '../../utils/classesManagement'

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

function TeacherClassDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [classItem, setClassItem] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [availableStudents, setAvailableStudents] = useState([])
  const [addModalLoading, setAddModalLoading] = useState(false)
  const [savingClass, setSavingClass] = useState(false)
  const [savingAssignments, setSavingAssignments] = useState(false)
  const [removingId, setRemovingId] = useState('')

  const loadClassDetails = async () => {
    if (!id) {
      setError('Class not found.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const [classData, studentData] = await Promise.all([
        fetchClassById(id),
        fetchClassStudents(id),
      ])

      if (!classData) {
        setClassItem(null)
        setStudents([])
        setError('Class not found or you do not have access to it.')
        return
      }

      setClassItem({
        ...classData,
        totalStudents: studentData.length,
      })
      setStudents(studentData)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load class details right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClassDetails()
  }, [id])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return students.filter((student) => {
      if (!term) {
        return true
      }

      return (
        student.name.toLowerCase().includes(term) ||
        student.className.toLowerCase().includes(term)
      )
    })
  }, [search, students])

  const openEditModal = () => {
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
  }

  const openAddModal = async () => {
    try {
      setAddModalLoading(true)
      setError('')
      const data = await fetchAvailableStudentsForClass(id)
      setAvailableStudents(data)
      setAddModalOpen(true)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load available students right now.',
      )
    } finally {
      setAddModalLoading(false)
    }
  }

  const closeAddModal = () => {
    setAddModalOpen(false)
    setAvailableStudents([])
  }

  const handleUpdateClass = async (values) => {
    if (!classItem) {
      return
    }

    setSavingClass(true)
    setError('')

    try {
      const updatedClass = await updateClassRecord(classItem.id, values)
      setClassItem((current) => ({
        ...(current || {}),
        ...updatedClass,
        totalStudents: current?.totalStudents || students.length,
      }))
      closeEditModal()
    } finally {
      setSavingClass(false)
    }
  }

  const handleAssignStudents = async (selectedStudentIds) => {
    if (!classItem) {
      return
    }

    setSavingAssignments(true)
    setError('')

    try {
      await addStudentsToClass(classItem.id, selectedStudentIds)
      await loadClassDetails()
      closeAddModal()
    } finally {
      setSavingAssignments(false)
    }
  }

  const handleRemoveStudent = async (student) => {
    if (!classItem) {
      return
    }

    const confirmed = window.confirm(
      `Remove ${student.name || 'this student'} from this class?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setRemovingId(student.id)
      setError('')
      await removeStudentFromClass(classItem.id, student.id)
      setStudents((current) => current.filter((item) => item.id !== student.id))
      setClassItem((current) =>
        current ? { ...current, totalStudents: Math.max((current.totalStudents || 1) - 1, 0) } : current,
      )
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : 'Unable to remove student right now.',
      )
    } finally {
      setRemovingId('')
    }
  }

  const handleViewProfile = () => {
    window.alert('Student profile view coming soon.')
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="h-60 animate-pulse rounded-4xl border border-slate-200 bg-white shadow-soft" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error && !classItem) {
    return (
      <EmptyState
        title="Unable to load class"
        description={error}
        onCreate={() => navigate('/teacher/classes')}
        actionLabel="Back to Classes"
      />
    )
  }

  if (!classItem) {
    return null
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(242,93,13,0.06))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <button
                type="button"
                onClick={() => navigate('/teacher/classes')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand/20 hover:text-brand"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Classes
              </button>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <BookOpen className="h-3.5 w-3.5 text-brand" />
                Class details
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {classItem.className || 'Class Details'}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  Class {classItem.classLevel || 'N/A'}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  Starts {formatDate(classItem.startDate)}
                </span>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-[#f25d0d]">
                  {classItem.totalStudents || 0} students
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" onClick={openEditModal}>
                <PencilLine className="h-4 w-4" />
                Edit Class
              </Button>
              <Button onClick={openAddModal} loading={addModalLoading}>
                <Plus className="h-4 w-4" />
                Add Students
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SectionCard title="Assigned students" subtitle="Class roster">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-500">Total students</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{classItem.totalStudents || 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-500">Class level</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{classItem.classLevel || 'N/A'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-500">Start date</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{formatDate(classItem.startDate)}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm text-slate-500">Class name</p>
            <p className="mt-2 truncate text-lg font-semibold text-slate-900">{classItem.className || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-5">
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assigned students by name or class..."
          />
        </div>
      </SectionCard>

      {error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : null}

      {filteredStudents.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              removing={removingId === student.id}
              onRemove={handleRemoveStudent}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={students.length ? 'No students match your search' : 'No students assigned yet'}
          description={
            students.length
              ? 'Try a different search term.'
              : 'Add students to this class to begin building the batch roster.'
          }
          onCreate={openAddModal}
          actionLabel="Add Students"
        />
      )}

      <ClassFormModal
        open={editModalOpen}
        initialValues={classItem}
        isEditing
        loading={savingClass}
        onClose={closeEditModal}
        onSubmit={handleUpdateClass}
      />

      <AddStudentsModal
        open={addModalOpen}
        students={availableStudents}
        loading={savingAssignments}
        onClose={closeAddModal}
        onSubmit={handleAssignStudents}
      />
    </div>
  )
}

export default TeacherClassDetails
