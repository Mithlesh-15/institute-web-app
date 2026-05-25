const variantClasses = {
  primary:
    'bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-[0_18px_40px_rgba(37,99,235,0.22)] hover:shadow-[0_20px_48px_rgba(37,99,235,0.28)]',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:border-[#2563eb]/25 hover:bg-[#f8fafc]',
  ghost: 'bg-transparent text-[#374151] hover:bg-black/5',
}

function Button({
  children,
  className = '',
  loading = false,
  loadingLabel = 'Checking credentials...',
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold',
        'transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0',
        fullWidth ? 'w-full' : '',
        variantClasses[variant],
        className,
      ].join(' ')}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
