import { useEffect, useState } from 'react'
import { Video, ExternalLink, Calendar } from 'lucide-react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import { fetchLiveEvents } from '../../utils/galleryManagement'

function StudentLive() {
  const [liveEvents, setLiveEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <div className="space-y-6">
      {/* Header section */}
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <Video className="h-3.5 w-3.5 text-[#2563eb]" />
                Raj Tuition Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Live Classes
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                View currently active live meeting classrooms and join online streams shared by your teachers.
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
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-soft">
          <Video className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          No live classes currently scheduled. You will see links here once classes are set.
        </div>
      )}
    </div>
  )
}

export default StudentLive
