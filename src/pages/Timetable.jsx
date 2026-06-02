import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Calendar, Sparkles, BookOpen } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

function Timetable() {
  const categories = [
    {
      title: 'Junior Classes (Grade 6 - 8)',
      grades: ['Class 6', 'Class 7', 'Class 8'],
      schedule: [
        { subject: 'Science', time: '3 PM – 4 PM' },
        { subject: 'Mathematics', time: '4 PM – 5 PM' },
        { subject: 'English', time: '5 PM – 6 PM' }
      ]
    },
    {
      title: 'Secondary Classes (Grade 9 - 10)',
      grades: ['Class 9', 'Class 10'],
      schedule: [
        { subject: 'Mathematics', time: '5 PM – 6 PM' },
        { subject: 'Science', time: '6 PM – 7 PM' },
        { subject: 'English', time: '7 PM – 8 PM' }
      ]
    },
    {
      title: 'Senior Secondary (Grade 11 - 12)',
      grades: ['Class 11', 'Class 12'],
      schedule: [
        { subject: 'Physics', class11: '3 PM – 4 PM', class12: '5 PM – 6 PM' },
        { subject: 'Chemistry', class11: '4 PM – 5 PM', class12: '6 PM – 7 PM' },
        { subject: 'Mathematics', class11: '5 PM – 6 PM', class12: '7 PM – 8 PM' },
        { subject: 'Biology', class11: '6 PM – 7 PM', class12: '4 PM – 5 PM' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md group-hover:scale-105 transition-transform">
              <BrandLogo className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Raj Tuition Classes
            </span>
          </Link>
          
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold hover:text-blue-400 transition-colors bg-white/10 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-semibold tracking-wide mb-4">
            <Sparkles className="h-4 w-4" />
            Academic Batches 2026-27
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
            Complete Class Timetable
          </h1>
          <p className="text-lg text-slate-500 mt-4 leading-relaxed">
            View timings for all batches from Grade 6 to Grade 12. Reach out to our center desk if you have any scheduling conflicts.
          </p>
        </div>

        {/* Timetables list */}
        <div className="space-y-16">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{cat.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">Covers batches for: {cat.grades.join(', ')}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 w-fit">
                  <Calendar className="h-3.5 w-3.5" />
                  Regular Batches
                </span>
              </div>

              {/* Responsive Schedule Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-4">Subject</th>
                      {cat.grades.length === 2 ? (
                        <>
                          <th className="py-4 px-4">Class 11 Timing</th>
                          <th className="py-4 px-4">Class 12 Timing</th>
                        </>
                      ) : (
                        <th className="py-4 px-4">Daily Timing</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {cat.schedule.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-bold text-slate-900">{row.subject}</span>
                        </td>
                        {cat.grades.length === 2 ? (
                          <>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg">
                                <Clock className="h-3.5 w-3.5" />
                                {row.class11}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-lg">
                                <Clock className="h-3.5 w-3.5" />
                                {row.class12}
                              </span>
                            </td>
                          </>
                        ) : (
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 text-blue-600 bg-blue-50/50 px-3 py-1 rounded-lg">
                              <Clock className="h-3.5 w-3.5" />
                              {row.time}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <p>© {new Date().getFullYear()} Raj Tuition Classes. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default Timetable
