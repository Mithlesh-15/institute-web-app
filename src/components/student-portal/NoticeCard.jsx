import { Bell } from 'lucide-react'

function NoticeCard({ notice }) {
  const handleClick = () => {
    if (notice.noticeLink) {
      window.open(notice.noticeLink, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <article
      onClick={handleClick}
      className={[
        'rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300',
        notice.noticeLink ? 'cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900 transition-colors whitespace-normal break-words">
            {notice.title}
          </h3>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
          <Bell className="h-4 w-4" />
        </span>
      </div>
    </article>
  )
}

export default NoticeCard
