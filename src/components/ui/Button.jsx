const variantClasses = {
  primary:
    'bg-gradient-to-r from-[#f25d0d] to-[#ff9100] text-white shadow-[0_18px_40px_rgba(242,93,13,0.22)] hover:shadow-[0_20px_48px_rgba(242,93,13,0.28)]',
  secondary:
    'border border-[#f25d0d]/20 bg-white text-[#9a3d07] hover:border-[#f25d0d]/35 hover:bg-[#fff8f1]',
  ghost: 'bg-transparent text-[#374151] hover:bg-black/5',
}

function Button({
  children,
  className = '',
  loading = false,
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
          <span>Checking credentials...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
