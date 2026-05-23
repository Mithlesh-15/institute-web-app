import { useEffect, useMemo, useState } from 'react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-students/EmptyState'
import FilterTabs from '../../components/teacher-students/FilterTabs'
import SearchBar from '../../components/teacher-students/SearchBar'
import StudentCard from '../../components/teacher-students/StudentCard'
import {
  STUDENT_CLASS_OPTIONS,
  deleteStudentById,
  fetchStudents,
} from '../../utils/studentManagement'

function TeacherStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let mounted = true

    const loadStudents = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStudents()

        if (mounted) {
          setStudents(data)
        }
      } catch (fetchError) {
        if (mounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to load students right now.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadStudents()

    return () => {
      mounted = false
    }
  }, [])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesClass =
        classFilter === 'All' || student.className === classFilter

      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.phone.toLowerCase().includes(term)

      return matchesClass && matchesSearch
    })
  }, [classFilter, search, students])

  const totalStudents = students.length

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(
      `Delete ${student.name || 'this student'}? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(student.id)
      setError('')
      await deleteStudentById(student.id)
      setStudents((current) => current.filter((item) => item.id !== student.id))
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete student right now.',
      )
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        subtitle="Student management"
        title="Students"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm text-slate-500">
              Total students
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {totalStudents}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Filter and search students by class, name, or phone number.
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <FilterTabs
            value={classFilter}
            options={STUDENT_CLASS_OPTIONS}
            onChange={setClassFilter}
          />
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
              onDelete={handleDeleteStudent}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No students found"
          description="Try a different search term or class filter."
        />
      )}
    </div>
  )
}

export default TeacherStudents
