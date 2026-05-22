function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  error,
  hint,
  rightSlot,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <label className={`block ${className}`} htmlFor={id}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {rightSlot}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        disabled={disabled}
        className={[
          'w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-slate-900 outline-none',
          'border-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-all duration-300',
          'placeholder:text-slate-400 focus:border-[#f25d0d] focus:ring-4 focus:ring-[#f25d0d]/15',
          error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : '',
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-400' : 'hover:border-slate-300',
        ].join(' ')}
        {...props}
      />
      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-sm text-slate-500">{hint}</p>
      ) : null}
    </label>
  )
}

export default Input
