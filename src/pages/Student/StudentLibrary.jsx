import { useState, useMemo, useEffect } from 'react'
import { BookOpen, ExternalLink, Library, FolderOpen, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchStudentClasses, fetchStudentMaterials } from '../../utils/studentPortal'

function StudentLibrary() {
  const [activeTab, setActiveTab] = useState('')

  // Fetch classes the student is in
  const { data: classes = [] } = useQuery({
    queryKey: ['studentClasses'],
    queryFn: fetchStudentClasses,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 12 * 60 * 60 * 1000,
  })

  // Fetch all study materials
  const { data: materials = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['studentMaterials'],
    queryFn: fetchStudentMaterials,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours cache
    gcTime: 12 * 60 * 60 * 1000,
  })

  const error = queryError ? (queryError.message || 'Unable to load study materials right now.') : ''

  // Generate dynamic tabs: unique enrolled class types + 'Other'
  const tabs = useMemo(() => {
    const enrolledTypes = [...new Set(classes.map((c) => c.classType).filter(Boolean))]
    return [...enrolledTypes, 'Other']
  }, [classes])

  // Set first tab as active by default
  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0])
    }
  }, [tabs, activeTab])

  // Filter materials based on the active tab selection
  const filteredMaterials = useMemo(() => {
    if (!activeTab) return []

    if (activeTab === 'Other') {
      const enrolledClassIds = new Set(classes.map((c) => c.id))
      return materials.filter((m) => !m.classId || !enrolledClassIds.has(m.classId))
    } else {
      // Get class IDs that match this classType (e.g. '11th')
      const targetClassIds = new Set(
        classes.filter((c) => c.classType === activeTab).map((c) => c.id)
      )
      return materials.filter((m) => m.classId && targetClassIds.has(m.classId))
    }
  }, [activeTab, classes, materials])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Study Hub
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">E-Library</h1>
            <p className="text-sm text-slate-500 mt-1">Access notes, sample papers, and lectures uploaded by teachers.</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand">
            <Library className="h-7 w-7" />
          </div>
        </div>
      </section>

      {/* Tabs Selector Bar */}
      {!loading && !error && tabs.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  'rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                  isSelected
                    ? 'bg-brand text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                {tab === 'Other' ? 'Other Materials' : `${tab} Section`}
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Materials List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft" />
          <div className="h-44 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-brand">
              {activeTab === 'Other' ? <FolderOpen className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeTab === 'Other' ? 'Other / General Materials' : `${activeTab} Class Materials`}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'Other' ? 'Resources open for all student classes' : `Resources matching enrolled ${activeTab} classes.`}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.length ? (
              filteredMaterials.map((item) => (
                <a
                  key={item.id}
                  href={item.materialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-150 bg-slate-50/50 p-4 transition hover:border-brand/20 hover:bg-white hover:shadow-md group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-brand transition-colors shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 truncate group-hover:text-slate-900">
                      {item.materialName}
                    </span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-brand shrink-0 transition-colors" />
                </a>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-sm text-slate-400">
                No materials uploaded for this section yet.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default StudentLibrary
