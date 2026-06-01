import { useEffect, useState } from 'react'
import { Video, Plus, ExternalLink, Trash2, Calendar } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import {
  fetchLiveEvents,
  createLiveEvent,
  deleteEvent
} from '../../utils/galleryManagement'

function CreateLiveModal({ open, loading, onClose, onSave }) {
  const [liveName, setLiveName] = useState('')
  const [liveLink, setLiveLink] = useState('')

  useEffect(() => {
    if (!open) return
    setLiveName('')
    setLiveLink('')
  }, [open])

  const handleSave = async () => {
    if (!liveName.trim()) {
      alert('Please enter a live class name.')
      return
    }
    await onSave({ name: liveName, link: liveLink })
  }

  return (
    <Modal
      open={open}
      title="Create Live Class"
      description="Start a new live stream or video class and share the link with students."
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Live Class Name"
          value={liveName}
          onChange={(e) => setLiveName(e.target.value)}
          placeholder="e.g. Grade 10 Math Live Stream"
        />

        <Input
          label="Live Link / URL (Optional)"
          value={liveLink}
          onChange={(e) => setLiveLink(e.target.value)}
          placeholder="https://zoom.us/j/... or https://meet.google.com/..."
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading} loadingLabel="Creating live...">
            Create Live Class
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function TeacherLive() {
  const [liveEvents, setLiveEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const loadLiveEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchLiveEvents()
      setLiveEvents(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load live classes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLiveEvents()
  }, [])

  const handleCreateLive = async ({ name, link }) => {
    try {
      setSaving(true)
      setError('')
      await createLiveEvent({ name, link })
      setCreateModalOpen(false)
      await loadLiveEvents()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create live class.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLive = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName || 'this live class'}"?`)) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await deleteEvent(eventId)
      await loadLiveEvents()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete live class.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <Video className="h-3.5 w-3.5 text-[#2563eb]" />
                Live Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Live Broadcasts
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Create Zoom or Google Meet classes, launch streams, and provide link access to all students instantly.
              </p>
            </div>

            <div className="flex shrink-0">
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Live
              </Button>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : liveEvents.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liveEvents.map((live) => (
            <div
              key={live.id}
              className="group relative rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 pr-8">
                    {live.eventName}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(live.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 animate-pulse shrink-0">
                  LIVE
                </span>
              </div>

              {live.link && (
                <div className="mt-5 flex items-center gap-2">
                  <a
                    href={live.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                  >
                    Join Live Class
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteLive(live.id, live.eventName)
                }}
                className="absolute right-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 shadow-sm transition hover:bg-red-100 lg:opacity-0 lg:group-hover:opacity-100 disabled:opacity-50"
                disabled={saving}
                title="Delete live class"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-soft">
          <Video className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          No live classes created yet. Click "Create Live" to share a meeting link.
        </div>
      )}

      <CreateLiveModal
        open={createModalOpen}
        loading={saving}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateLive}
      />
    </div>
  )
}

export default TeacherLive
