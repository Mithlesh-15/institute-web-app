function AttendanceSummary({ totalStudents = 0, presentCount = 0, absentCount = 0 }) {
  const cards = [
    { label: 'Total students', value: totalStudents, tone: 'text-slate-900' },
    { label: 'Present', value: presentCount, tone: 'text-[#22c55e]' },
    { label: 'Absent', value: absentCount, tone: 'text-[#ef4444]' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-soft"
        >
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}

export default AttendanceSummary
