import { Search } from 'lucide-react'

function SearchBar({ value, onChange, placeholder = 'Search students by name or phone...' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={onChange}
        type="search"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15"
      />
    </div>
  )
}

export default SearchBar
