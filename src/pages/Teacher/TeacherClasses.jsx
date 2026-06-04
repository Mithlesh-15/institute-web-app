import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const { data: classes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['teacherClasses'],
    queryFn: fetchClassesWithStudentCounts,
    staleTime: 2 * 60 * 60 * 1000,
  })

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
        await updateClassRecord(editingClass.id, values)
      } else {
        await createClassRecord(values)
      }
      queryClient.invalidateQueries({ queryKey: ['teacherClasses'] })
      closeModal()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save class.')
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
      queryClient.invalidateQueries({ queryKey: ['teacherClasses'] })
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
