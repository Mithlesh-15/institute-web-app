import { X } from 'lucide-react'

function Modal({ open, title, description, onClose, children, size = 'lg' }) {
  if (!open) {
    return null
  }

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center">
      <div
        className={[
          'flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)]',
          widthClasses[size] || widthClasses.lg,
        ].join(' ')}
      >
        {(title || description || onClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
            <div>
              {title ? <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2> : null}
              {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
            </div>

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-brand/20 hover:bg-slate-50 hover:text-brand"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
