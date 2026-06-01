import { useEffect, useMemo, useState, useRef } from 'react'
import { Calendar, Image as ImageIcon, Plus, ArrowLeft, ExternalLink, UploadCloud, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import FilterTabs from '../../components/teacher-classes/FilterTabs'
import ImageLightbox from '../../components/ui/ImageLightbox'
import {
  fetchEvents,
  createEvent,
  fetchGalleryItems,
  addGalleryItem,
  uploadGalleryPhoto,
  deleteEvent,
  deleteGalleryItem,
} from '../../utils/galleryManagement'

function CreateEventModal({ open, loading, onClose, onSave }) {
  const [eventName, setEventName] = useState('')
  const [eventYear, setEventYear] = useState('2026')

  useEffect(() => {
    if (!open) return
    setEventName('')
    setEventYear(String(new Date().getFullYear()))
  }, [open])

  const handleSave = async () => {
    if (!eventName.trim()) {
      alert('Please enter an event name.')
      return
    }
    await onSave({ eventName, eventYear })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, index) => String(currentYear - index))

  return (
    <Modal
      open={open}
      title="Create Event"
      description="Create a new event bucket to group photos and gallery links."
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Event Name"
          value={eventName}
          onChange={(event) => setEventName(event.target.value)}
          placeholder="e.g. Annual Sports Day"
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Event Year</span>
          <select
            value={eventYear}
            onChange={(event) => setEventYear(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading} loadingLabel="Creating event...">
            Create Event
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function AddPhotoModal({ open, loading, onClose, onSave }) {
  const fileInputRef = useRef(null)
  const [uploadType, setUploadType] = useState('key') // 'key' or 'all'
  const [linkInput, setLinkInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState('')

  useEffect(() => {
    if (!open) return
    setUploadType('key')
    setLinkInput('')
    setSelectedFile(null)
    setFilePreview('')
  }, [open])

  useEffect(() => {
    return () => {
      if (filePreview && filePreview.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0] || null
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setSelectedFile(file)
      setFilePreview(previewUrl)
    }
  }

  const handleSave = async () => {
    if (uploadType === 'key') {
      if (!selectedFile) {
        alert('Please select a photo file to upload.')
        return
      }
      await onSave({ type: 'key', file: selectedFile })
    } else {
      if (!linkInput.trim()) {
        alert('Please enter the photos link (e.g., Google Drive link).')
        return
      }
      await onSave({ type: 'all', link: linkInput })
    }
  }

  return (
    <Modal
      open={open}
      title="Add Photos/Link"
      description="Upload a key photo or link an external gallery album."
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Upload Type</span>
          <select
            value={uploadType}
            onChange={(event) => setUploadType(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
          >
            <option value="key">Key Photo (Single Image Upload)</option>
            <option value="all">All Photos (Shared Drive Link)</option>
          </select>
        </label>

        {uploadType === 'key' ? (
          <div className="space-y-3">
            <span className="block text-sm font-medium text-slate-700">Select Image</span>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center hover:border-brand hover:bg-blue-50/10 transition-all duration-300"
            >
              {filePreview ? (
                <div className="h-40 w-full overflow-hidden rounded-xl">
                  <img src={filePreview} alt="Selected preview" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="text-sm font-medium text-slate-600">Click to upload an image file</p>
                  <p className="text-xs text-slate-400">PNG, JPG, JPEG up to 10MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <Input
            label="Gallery / Drive Album Link"
            value={linkInput}
            onChange={(event) => setLinkInput(event.target.value)}
            placeholder="https://drive.google.com/..."
          />
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading} loadingLabel="Saving...">
            Save Photo/Link
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function TeacherGallery() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [selectedEventDetail, setSelectedEventDetail] = useState(null)
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [yearFilter, setYearFilter] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [addPhotoModalOpen, setAddPhotoModalOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxPhotoUrl, setLightboxPhotoUrl] = useState('')

  const uniqueYears = useMemo(() => {
    const yearsSet = new Set(events.map((e) => e.eventYear).filter(Boolean))
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a))
  }, [events])

  const filteredEvents = useMemo(() => {
    if (!yearFilter) return []
    return events.filter((e) => e.eventYear === yearFilter)
  }, [yearFilter, events])

  useEffect(() => {
    if (uniqueYears.length > 0 && !yearFilter) {
      setYearFilter(uniqueYears[0])
    }
  }, [uniqueYears, yearFilter])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchEvents()
      setEvents(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load events.')
    } finally {
      setLoading(false)
    }
  }

  const loadEventDetail = async (eventId) => {
    if (!eventId) {
      setSelectedEventDetail(null)
      setGalleryItems([])
      return
    }

    try {
      setDetailLoading(true)
      setError('')
      const matchedEvent = events.find((item) => item.id === eventId)
      setSelectedEventDetail(matchedEvent || null)
      const items = await fetchGalleryItems(eventId)
      setGalleryItems(items)
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load event photos.')
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    loadEventDetail(selectedEventId)
  }, [selectedEventId])

  const handleCreateEvent = async ({ eventName, eventYear }) => {
    try {
      setSaving(true)
      setError('')
      const newEvent = await createEvent({ eventName, eventYear })
      setCreateModalOpen(false)
      await loadEvents()
      setSelectedEventId(newEvent.id)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create event.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddPhotoOrLink = async (payload) => {
    try {
      setSaving(true)
      setError('')
      let publicLink = ''

      if (payload.type === 'key') {
        publicLink = await uploadGalleryPhoto(payload.file)
      } else {
        publicLink = payload.link
      }

      await addGalleryItem({
        eventId: selectedEventId,
        type: payload.type,
        link: publicLink,
      })

      setAddPhotoModalOpen(false)
      await loadEventDetail(selectedEventId)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to add photo/link.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName || 'this event'}" and all its photos?`)) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await deleteEvent(eventId)
      if (selectedEventId === eventId) {
        setSelectedEventId(null)
      }
      await loadEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete event.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePhoto = async (itemId, link) => {
    if (!window.confirm('Are you sure you want to delete this photo/link?')) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await deleteGalleryItem(itemId, link)
      await loadEventDetail(selectedEventId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete gallery item.')
    } finally {
      setSaving(false)
    }
  }


  const keyPhotos = useMemo(() => {
    return galleryItems.filter((item) => item.type === 'key')
  }, [galleryItems])

  const allPhotosLink = useMemo(() => {
    return galleryItems.find((item) => item.type === 'all')?.link || ''
  }, [galleryItems])

  if (selectedEventId && selectedEventDetail) {
    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-soft">
          <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand/20 hover:text-brand"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Events
                </button>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {selectedEventDetail.eventName}
                </h1>
                <p className="mt-3 text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Event Year: {selectedEventDetail.eventYear}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(selectedEventId, selectedEventDetail.eventName)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 border border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 disabled:opacity-50"
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Event
                </button>
                <Button onClick={() => setAddPhotoModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Photo / Link
                </Button>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {detailLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <SectionCard title="Photos" subtitle="Key highlight images">
              {keyPhotos.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {keyPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:shadow-md hover:border-blue-300"
                    >
                      <div
                        onClick={() => {
                          setLightboxPhotoUrl(photo.link)
                          setLightboxOpen(true)
                        }}
                        className="aspect-4/3 w-full overflow-hidden bg-slate-100 cursor-pointer"
                      >
                        <img
                          src={photo.link}
                          alt="Gallery item"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePhoto(photo.id, photo.link)
                        }}
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all duration-300 hover:bg-red-600 lg:opacity-0 lg:group-hover:opacity-100 disabled:opacity-50"
                        disabled={saving}
                        title="Delete photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-500">
                  No photos uploaded for this event.
                </div>
              )}
            </SectionCard>

            {allPhotosLink ? (
              <SectionCard title="Shared Gallery Link" subtitle="View all files on Drive or Cloud storage">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 break-all">{allPhotosLink}</p>
                    <p className="text-xs text-slate-400 mt-1">This link points to an external album hosted by the coaching center.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const allPhotoItem = galleryItems.find((item) => item.type === 'all')
                        if (allPhotoItem) {
                          handleDeletePhoto(allPhotoItem.id, allPhotoItem.link)
                        }
                      }}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                      disabled={saving}
                      title="Delete link"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <a
                      href={allPhotosLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md"
                    >
                      Open All Photos Album
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </SectionCard>
            ) : null}
          </div>
        )}

        <AddPhotoModal
          open={addPhotoModalOpen}
          loading={saving}
          onClose={() => setAddPhotoModalOpen(false)}
          onSave={handleAddPhotoOrLink}
        />

        <ImageLightbox
          open={lightboxOpen}
          src={lightboxPhotoUrl}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <ImageIcon className="h-3.5 w-3.5 text-brand" />
                Raj Tuition Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Gallery
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                View coaching events, sports days, festival celebrations, and student photos year-wise.
              </p>
            </div>

            <div className="flex shrink-0">
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Event
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

      <SectionCard title="Filter events" subtitle="Select year to view albums">
        <FilterTabs
          value={yearFilter}
          options={uniqueYears}
          onChange={setYearFilter}
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
      ) : filteredEvents.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="group relative rounded-[1.75rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="pr-8">
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand transition-colors">
                    {event.eventName}
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shrink-0">
                  {event.eventYear}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-brand font-semibold">
                <span>View Event Album &rarr;</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteEvent(event.id, event.eventName)
                }}
                className="absolute right-3 bottom-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 shadow-sm transition hover:bg-red-100 lg:opacity-0 lg:group-hover:opacity-100 disabled:opacity-50"
                disabled={saving}
                title="Delete event"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-soft">
          No events found for the selected year.
        </div>
      )}

      <CreateEventModal
        open={createModalOpen}
        loading={saving}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateEvent}
      />

      <ImageLightbox
        open={lightboxOpen}
        src={lightboxPhotoUrl}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}

export default TeacherGallery
