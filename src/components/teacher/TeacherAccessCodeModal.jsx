import Button from '../ui/Button'

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M12 3 4.5 6.5V12c0 5 3.2 8.7 7.5 9.9 4.3-1.2 7.5-4.9 7.5-9.9V6.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m9.5 12 1.8 1.8 3.5-3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TeacherAccessCodeModal({
  open,
  code,
  error,
  loading,
  onCodeChange,
  onClose,
  onSubmit,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-4xl border border-white/80 bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.28)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand">
              <ShieldIcon />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                Secure access
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                Teacher access code
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close access code dialog"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          This private portal only opens after a valid staff access code is
          verified. Enter the code your administrator provided to continue the
          onboarding flow.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Secret Teacher Access Code
            </span>
            <input
              value={code}
              onChange={onCodeChange}
              type="password"
              autoComplete="off"
              className={[
                'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none',
                'placeholder:text-slate-400 transition focus:border-brand focus:ring-4 focus:ring-brand/15',
              ].join(' ')}
              placeholder="Enter access code"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : (
            null
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="secondary" className="sm:w-auto" onClick={onClose}>
              Back to login
            </Button>
            <Button type="submit" loading={loading} className="sm:flex-1">
              Verify access code
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherAccessCodeModal
