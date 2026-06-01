import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Button from '../../components/ui/Button'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import ClassCard from '../../components/teacher-classes/ClassCard'
import ClassFormModal from '../../components/teacher-classes/ClassFormModal'
import EmptyState from '../../components/teacher-classes/EmptyState'
import FilterTabs from '../../components/teacher-classes/FilterTabs'
import SearchBar from '../../components/teacher-classes/SearchBar'
import {
  CLASS_OPTIONS,
  createClassRecord,
  deleteClassRecord,
  fetchClassesWithStudentCounts,
  updateClassRecord,
} from '../../utils/classesManagement'

const initialModalState = {
  className: '',
  classLevel: '6th',
  startDate: '',
}

function TeacherClasses() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let mounted = true

    const loadClasses = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchClassesWithStudentCounts()

        if (mounted) {
          setClasses(data)
        }
      } catch (fetchError) {
        if (mounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unable to load classes right now.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadClasses()

    return () => {
      mounted = false
    }
  }, [])

  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase()

    return classes.filter((classItem) => {
      const matchesFilter =
        classFilter === 'All' || classItem.classLevel === classFilter

      const matchesSearch =
        !term ||
        classItem.className.toLowerCase().includes(term) ||
        classItem.classLevel.toLowerCase().includes(term)

      return matchesFilter && matchesSearch
    })
  }, [classFilter, classes, search])

  const openCreateModal = () => {
    setEditingClass(null)
    setModalOpen(true)
  }

  const openEditModal = (classItem) => {
    setEditingClass(classItem)
    setModalOpen(true)
  }

  const openClassDetails = (classItem) => {
    navigate(`/teacher/classes/${classItem.id}`)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingClass(null)
  }

  const handleSaveClass = async (values) => {
    setSaving(true)
    setError('')

    try {
      if (editingClass) {
        const updatedClass = await updateClassRecord(editingClass.id, values)
        setClasses((current) =>
          current.map((item) =>
            item.id === updatedClass.id
              ? { ...updatedClass, totalStudents: item.totalStudents || 0 }
              : item,
          ),
        )
      } else {
        const createdClass = await createClassRecord(values)
        setClasses((current) => [{ ...createdClass, totalStudents: 0 }, ...current])
      }

      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClass = async (classItem) => {
    const confirmed = window.confirm(
      `Delete ${classItem.className || 'this class'}? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(classItem.id)
      setError('')
      await deleteClassRecord(classItem.id)
      setClasses((current) => current.filter((item) => item.id !== classItem.id))
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete class right now.',
      )
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Classes
          </h1>

          <div className="flex flex-col gap-3 sm:flex-row lg:w-136">
            <SearchBar
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button onClick={openCreateModal} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create Class
            </Button>
          </div>
        </div>
      </section>

      <SectionCard title="Class wise classification">
        <FilterTabs value={classFilter} options={CLASS_OPTIONS} onChange={setClassFilter} />
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
      ) : filteredClasses.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              deleting={deletingId === classItem.id}
              onOpen={openClassDetails}
              onEdit={openEditModal}
              onDelete={handleDeleteClass}
            />
          ))}
        </div>
      ) : classes.length ? (
        <EmptyState
          title="No classes match your filters"
        />
      ) : (
        <EmptyState
          title="No classes yet"
          onCreate={openCreateModal}
        />
      )}

      <ClassFormModal
        open={modalOpen}
        initialValues={editingClass || initialModalState}
        isEditing={Boolean(editingClass)}
        loading={saving}
        onClose={closeModal}
        onSubmit={handleSaveClass}
      />
    </div>
  )
}

export default TeacherClasses
