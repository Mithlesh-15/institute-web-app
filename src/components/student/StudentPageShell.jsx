function StudentPageShell({ eyebrow, title, description, children, rightSlot }) {
  return (
    <div className="min-h-screen bg-surface px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-4xl border border-white/90 bg-white shadow-soft">
          <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.05),rgba(219,234,254,0.4))] px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {description}
                </p>
              </div>
              {rightSlot ? <div>{rightSlot}</div> : null}
            </div>
          </div>
          <div className="p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default StudentPageShell
