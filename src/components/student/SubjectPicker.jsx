function SubjectPicker({ value, onToggle }) {
  const subjects = ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi']

  return (
    <div className="flex flex-wrap gap-3">
      {subjects.map((subject) => {
        const selected = value.includes(subject)

        return (
          <button
            key={subject}
            type="button"
            onClick={() => onToggle(subject)}
            className={[
              'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300',
              selected
                ? 'border-[#f25d0d] bg-[linear-gradient(135deg,rgba(242,93,13,0.95),rgba(255,145,0,0.9))] text-white shadow-[0_12px_24px_rgba(242,93,13,0.16)]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#f25d0d]/25 hover:bg-[#fff8ef]',
            ].join(' ')}
          >
            {subject}
          </button>
        )
      })}
    </div>
  )
}

export default SubjectPicker

