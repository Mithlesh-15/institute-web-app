function ClassSelector({ value, onChange }) {
  const classes = ['9th', '10th', '11th', '12th']

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {classes.map((className) => {
        const selected = value === className

        return (
          <button
            key={className}
            type="button"
            onClick={() => onChange(className)}
            className={[
              'rounded-2xl border px-4 py-4 text-sm font-semibold transition-all duration-300',
              selected
                ? 'border-[#f25d0d] bg-[linear-gradient(135deg,rgba(242,93,13,0.95),rgba(255,145,0,0.92))] text-white shadow-[0_16px_30px_rgba(242,93,13,0.18)]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#f25d0d]/25 hover:bg-[#fff8ef]',
            ].join(' ')}
          >
            {className}
          </button>
        )
      })}
    </div>
  )
}

export default ClassSelector

