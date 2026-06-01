import { Megaphone, Calendar, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchAllStudentNotices, formatPortalDate } from '../../utils/studentPortal'

function StudentNotices() {
  const { data: notices = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['studentAllNotices'],
    queryFn: fetchAllStudentNotices,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 15 * 60 * 1000,
  })

  const error = queryError ? (queryError.message || 'Unable to load notices right now.') : ''

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Announcements
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Notice Board</h1>
            <p className="text-sm text-slate-500 mt-1">Stay updated with the latest alerts, news, and class circulars.</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
            <Megaphone className="h-7 w-7" />
          </div>
        </div>
      </section>

      {/* Notices List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : notices.length ? (
        <div className="space-y-4">
          {notices.map((notice) => {
            const CardElement = notice.noticeLink ? 'a' : 'div'
            const extraProps = notice.noticeLink
              ? {
                  href: notice.noticeLink,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  role: 'link',
                }
              : {}

            return (
              <CardElement
                key={notice.id}
                {...extraProps}
                className={[
                  'block group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:border-[#2563eb]/20 hover:shadow-md',
                  notice.noticeLink ? 'cursor-pointer' : '',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 break-words group-hover:text-[#2563eb] transition-colors">
                      {notice.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Official Circular</span>
                    </div>
                  </div>

                  {notice.noticeLink ? (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#2563eb] transition">
                      <ExternalLink className="h-4.5 w-4.5" />
                    </span>
                  ) : null}
                </div>
              </CardElement>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No notices posted on the board yet.
        </div>
      )}
    </div>
  )
}

export default StudentNotices
