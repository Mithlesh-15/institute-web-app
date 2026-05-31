import { useEffect, useMemo, useState } from 'react'
import { Calendar, Image as ImageIcon, ArrowLeft, ExternalLink } from 'lucide-react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import FilterTabs from '../../components/teacher-classes/FilterTabs'
import ImageLightbox from '../../components/ui/ImageLightbox'
import {
  fetchEvents,
  fetchGalleryItems,
} from '../../utils/galleryManagement'

function StudentGallery() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [selectedEventDetail, setSelectedEventDetail] = useState(null)
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [yearFilter, setYearFilter] = useState('All')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxPhotoUrl, setLightboxPhotoUrl] = useState('')

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchEvents()
      setEvents(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load gallery events.')
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
      setError(detailError instanceof Error ? detailError.message : 'Unable to load event details.')
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

  const uniqueYears = useMemo(() => {
    const yearsSet = new Set(events.map((e) => e.eventYear).filter(Boolean))
    return ['All', ...Array.from(yearsSet).sort((a, b) => b.localeCompare(a))]
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => yearFilter === 'All' || e.eventYear === yearFilter)
  }, [yearFilter, events])

  const keyPhotos = useMemo(() => {
    return galleryItems.filter((item) => item.type === 'key')
  }, [galleryItems])

  const allPhotosLink = useMemo(() => {
    return galleryItems.find((item) => item.type === 'all')?.link || ''
  }, [galleryItems])

  if (selectedEventId && selectedEventDetail) {
    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#2563eb]/20 hover:text-[#2563eb]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Gallery
                </button>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {selectedEventDetail.eventName}
                </h1>
                <p className="mt-3 text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Event Year: {selectedEventDetail.eventYear}
                </p>
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
                      onClick={() => {
                        setLightboxPhotoUrl(photo.link)
                        setLightboxOpen(true)
                      }}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 cursor-pointer shadow-sm transition hover:shadow-md hover:border-blue-300"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        <img
                          src={photo.link}
                          alt="Gallery item"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
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
                  <a
                    href={allPhotosLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md"
                  >
                    Open All Photos Album
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </SectionCard>
            ) : null}
          </div>
        )}

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
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <ImageIcon className="h-3.5 w-3.5 text-[#2563eb]" />
                Raj Tuition Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Gallery
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                View coaching events, sports days, festival celebrations, and student photos year-wise.
              </p>
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
            <button
              type="button"
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-[#2563eb] transition-colors">
                    {event.eventName}
                  </h3>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shrink-0">
                  {event.eventYear}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-[#2563eb] font-semibold">
                <span>View Event Album &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-soft">
          No events found for the selected year.
        </div>
      )}
      <ImageLightbox
        open={lightboxOpen}
        src={lightboxPhotoUrl}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}

export default StudentGallery
