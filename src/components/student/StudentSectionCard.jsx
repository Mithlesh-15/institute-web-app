function StudentSectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${className}`}>
      {(title || subtitle) && (
        <div>
          {subtitle ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f25d0d]">
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

