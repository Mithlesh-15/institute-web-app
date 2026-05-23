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
                ? 'border-[#2563eb] bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.9))] text-white shadow-[0_12px_24px_rgba(37,99,235,0.16)]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-[#2563eb]/25 hover:bg-[#f8fafc]',
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
