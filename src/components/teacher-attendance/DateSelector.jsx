function DateSelector({ value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">Attendance Date</span>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15"
      />
    </label>
  )
}

export default DateSelector
