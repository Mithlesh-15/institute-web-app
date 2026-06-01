import { useState, useMemo } from 'react'
import { Image, X, Calendar, Camera, Eye, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchStudentEvents, fetchEventPhotos } from '../../utils/studentPortal'

function StudentGallery() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activePhoto, setActivePhoto] = useState(null)

  // 1. Fetch events (cache for 2 hours)
  const { data: events = [], isLoading: loadingEvents, error: eventsError } = useQuery({
    queryKey: ['studentEvents'],
    queryFn: fetchStudentEvents,
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    gcTime: 2 * 60 * 60 * 1000,
  })

  // 2. Fetch event photos (No cache - staleTime: 0)
  const { data: photos = [], isLoading: loadingPhotos, error: photosError } = useQuery({
    queryKey: ['eventPhotos', selectedEvent?.id],
    queryFn: () => fetchEventPhotos(selectedEvent.id),
    enabled: !!selectedEvent,
    staleTime: 0,
    gcTime: 0,
  })
  console

  // Filter photos based on user requirements:
  // - If type is null/empty: show as normal photo
  // - If type is 'all': show a "View All Photos" button with its link
  // - If type is anything else: ignore
  const { normalPhotos, allPhotosLink } = useMemo(() => {
    const normal = []
    let allLink = null

    photos.forEach((photo) => {
      const type = photo.type ? photo.type.trim().toLowerCase() : ''
      if (!type || type === 'photo' || type === 'key') {
        normal.push(photo)
      } else if (type === 'all') {
        allLink = photo.link
      }
    })

    return {
      normalPhotos: normal,
      allPhotosLink: allLink,
    }
  }, [photos])

  // Group events by year
  const eventsByYear = useMemo(() => {
    const groups = {}
    events.forEach((event) => {
      if (!event.eventYear) return
      const year = new Date(event.eventYear).getFullYear()
      if (!groups[year]) {
        groups[year] = []
      }
      groups[year].push(event)
    })
    // Sort years descending
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map((year) => ({
        year,
        list: groups[year],
      }))
  }, [events])

  const error = eventsError ? (eventsError.message || 'Unable to load gallery right now.') : ''

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Visual Memories
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Life at Raj Tuition Classes</h1>
            <p className="text-sm text-slate-500 mt-1">Explore photos of events, classroom sessions, and campus celebrations.</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
            <Camera className="h-7 w-7" />
          </div>
        </div>
      </section>

      {/* Main Events Grid divided by Year */}
      {loadingEvents ? (
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-7 w-20 animate-pulse bg-slate-200 rounded-lg" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-32 animate-pulse bg-white border border-slate-200 rounded-2xl shadow-soft" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : eventsByYear.length ? (
        <div className="space-y-8">
          {eventsByYear.map(({ year, list }) => (
            <div key={year} className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#2563eb]" />
                {year} Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full text-left group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-[#2563eb]/20 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-[#2563eb] transition-colors">
                          {event.eventName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Uploaded: {new Date(event.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#2563eb] transition">
                        <Image className="h-4.5 w-4.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No campus events uploaded in the gallery yet.
        </div>
      )}

      {/* Event Photos Popup Grid */}
      {selectedEvent ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2563eb]">
                  Event Photo Album
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 truncate max-w-[20rem] sm:max-w-[40rem]">
                  {selectedEvent.eventName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Event Date: {selectedEvent.eventYear}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Photos List Grid */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1 min-h-0">
              {loadingPhotos ? (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="aspect-square animate-pulse rounded-2xl bg-slate-100 border border-slate-200" />
                  ))}
                </div>
              ) : photosError ? (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  {photosError.message || 'Unable to load event photos.'}
                </div>
              ) : normalPhotos.length || allPhotosLink ? (
                <div className="space-y-6">
                  {normalPhotos.length ? (
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                      {normalPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          onClick={() => setActivePhoto(photo.link)}
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer shadow-sm hover:border-[#2563eb]/30 transition-all"
                        >
                          <img
                            src={photo.link}
                            alt="Event snapshot"
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-950/0 flex items-center justify-center group-hover:bg-slate-950/20 transition-all">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* End click link for all photos */}
                  {allPhotosLink ? (
                    <div className="border-t border-slate-100 pt-4 text-center">
                      <a
                        href={allPhotosLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-5 py-3 text-sm font-semibold text-[#2563eb] hover:bg-blue-100 transition"
                      >
                        <ExternalLink className="h-4.5 w-4.5 animate-pulse" />
                        View All Photos
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="text-center py-10 text-sm text-slate-400">
                  No photos uploaded for this event yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Full Screen Image Lightbox */}
      {activePhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 animate-fade-in">
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
            <img
              src={activePhoto}
              alt="Expanded view"
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StudentGallery
