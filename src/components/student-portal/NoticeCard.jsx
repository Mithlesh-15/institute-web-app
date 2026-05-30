import { Bell } from 'lucide-react'
import { formatPortalDate } from '../../utils/studentPortal'

function NoticeCard({ notice }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{notice.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{notice.message || 'No message available.'}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
          <Bell className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
        {formatPortalDate(notice.date)}
      </p>
    </article>
  )
}

export default NoticeCard
