function SectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${className}`}>
      {(title || subtitle || action) ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {subtitle ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                {subtitle}
              </p>
            ) : null}
            {title ? <h2 className="mt-2 text-xl font-semibold text-slate-900">{title}</h2> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      ) : null}

      <div className={title || subtitle || action ? 'mt-5' : ''}>{children}</div>
    </section>
  )
}

export default SectionCard
