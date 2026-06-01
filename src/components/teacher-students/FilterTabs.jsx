function FilterTabs({ value, options, onChange }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-full gap-2 rounded-full bg-slate-100 p-1">
        {options.map((option) => {
          const active = value === option

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={[
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
                active
                  ? 'bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.95))] text-white shadow-[0_12px_24px_rgba(37,99,235,0.16)]'
                  : 'text-slate-600 hover:text-brand',
              ].join(' ')}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default FilterTabs
