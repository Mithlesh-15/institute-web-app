import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, Library, Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import {
  createTeacherMaterial,
  deleteTeacherMaterial,
  fetchTeacherClassesForDropdown,
  fetchTeacherMaterials,
} from '../../utils/teacherPortal'
import { createClassRecord } from '../../utils/classesManagement'
import FilterTabs from '../../components/teacher-classes/FilterTabs'

function AddMaterialModal({ open, loading, onClose, onSave }) {
  const [materialName, setMaterialName] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('6th')
  const [materialLink, setMaterialLink] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    setMaterialName('')
    setSelectedLevel('6th')
    setMaterialLink('')
  }, [open])

  const handleSave = async () => {
    if (!materialName.trim()) {
      alert('Please enter a material name.')
      return
    }
    if (!materialLink.trim()) {
      alert('Please enter a material link.')
      return
    }
    await onSave({
      materialName,
      selectedLevel,
      materialLink,
    })
  }

  const levels = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG', 'Other']

  return (
    <Modal
      open={open}
      title="Add Material"
      description="Share notes, PDFs, or class links with the teacher library."
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Material Name"
          value={materialName}
          onChange={(event) => setMaterialName(event.target.value)}
          placeholder="Enter material name"
        />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Class</span>
          <select
            value={selectedLevel}
            onChange={(event) => setSelectedLevel(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15"
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Material Link"
          value={materialLink}
          onChange={(event) => setMaterialLink(event.target.value)}
          placeholder="https://..."
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading} loadingLabel="Saving material...">
            Save Material
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function TeacherLibrary() {
  const [materials, setMaterials] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [classFilter, setClassFilter] = useState('All')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [materialRows, classRows] = await Promise.all([
        fetchTeacherMaterials(),
        fetchTeacherClassesForDropdown(),
      ])
      setMaterials(materialRows)
      setClasses(classRows)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load study materials.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const groupedMaterials = useMemo(() => {
    const groups = {}
    const levelOrder = ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG', 'Other']

    materials.forEach((material) => {
      const matchedClass = classes.find((c) => c.id === material.classId)
      const level = matchedClass?.classLevel || 'Unassigned'

      if (!groups[level]) {
        groups[level] = {
          classLabel: level === 'Unassigned' ? 'Unassigned' : level === 'Other' ? 'Other' : `Class ${level}`,
          items: [],
        }
      }
      groups[level].items.push(material)
    })

    const sortedGroups = {}
    levelOrder.forEach((level) => {
      if (groups[level]) {
        sortedGroups[level] = groups[level]
      }
    })

    if (groups['Unassigned']) {
      sortedGroups['Unassigned'] = groups['Unassigned']
    }

    Object.keys(groups).forEach((key) => {
      if (!sortedGroups[key]) {
        sortedGroups[key] = groups[key]
      }
    })

    return sortedGroups
  }, [classes, materials])

  const filteredGroupedMaterials = useMemo(() => {
    if (classFilter === 'All') {
      return groupedMaterials
    }
    const filtered = {}
    if (groupedMaterials[classFilter]) {
      filtered[classFilter] = groupedMaterials[classFilter]
    }
    return filtered
  }, [groupedMaterials, classFilter])

  const handleAddMaterial = async ({ materialName, selectedLevel, materialLink }) => {
    try {
      setSaving(true)
      setError('')

      let targetClass = classes.find((c) => c.classLevel === selectedLevel)
      if (!targetClass) {
        targetClass = await createClassRecord({
          className: `Class ${selectedLevel}`,
          classLevel: selectedLevel,
          startDate: new Date().toISOString().split('T')[0],
        })
      }

      await createTeacherMaterial({
        materialName,
        classId: targetClass.id,
        materialLink,
      })
      setModalOpen(false)
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save material.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (material) => {
    const confirmed = window.confirm(`Delete ${material.materialName || 'this material'}?`)

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(material.id)
      setError('')
      await deleteTeacherMaterial(material.id)
      setMaterials((current) => current.filter((item) => item.id !== material.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete material.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <Library className="h-3.5 w-3.5 text-[#2563eb]" />
                Raj Tuition Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Library
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Keep study links and class materials grouped by batch in a simple library view.
              </p>
            </div>

          </div>
        </div>
      </section>

      <SectionCard title="Filter library" subtitle="Class-wise view">
        <FilterTabs
          value={classFilter}
          options={['All', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG', 'Other']}
          onChange={setClassFilter}
        />
      </SectionCard>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : Object.keys(filteredGroupedMaterials).length ? (
        <div className="space-y-5">
          {Object.entries(filteredGroupedMaterials).map(([groupKey, group]) => (
            <SectionCard
              key={groupKey}
              title={group.classLabel}
              subtitle="Study materials"
              className="bg-white"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => {
                      if (material.materialLink) {
                        window.open(material.materialLink, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-slate-900 truncate">{material.materialName}</p>
                        <p className="mt-2 break-all text-xs text-slate-400 truncate">{material.materialLink}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(material)
                        }}
                        disabled={deletingId === material.id}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50 shrink-0"
                        aria-label="Delete material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-soft">
          {classFilter === 'All'
            ? 'No study materials added yet.'
            : `No study materials added for Class ${classFilter} yet.`}
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-30">
        <Button onClick={() => setModalOpen(true)} className="shadow-[0_18px_40px_rgba(37,99,235,0.28)]">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>

      <AddMaterialModal
        open={modalOpen}
        loading={saving}
        onClose={() => setModalOpen(false)}
        onSave={handleAddMaterial}
      />
    </div>
  )
}

export default TeacherLibrary
