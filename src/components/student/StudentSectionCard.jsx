function StudentSectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${className}`}>
      {(title || subtitle) && (
        <div>
          {subtitle ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
              {subtitle}
            </p>
          ) : null}
          {title ? <h2 className="mt-2 text-xl font-semibold text-slate-900">{title}</h2> : null}
        </div>
      )}
      <div className={title || subtitle ? 'mt-5' : ''}>{children}</div>
    </section>
  )
}

export default StudentSectionCard
