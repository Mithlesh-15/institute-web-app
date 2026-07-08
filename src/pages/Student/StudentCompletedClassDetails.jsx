import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Clock, FileText, CheckCircle2, XCircle, Trophy, X, Award } from 'lucide-react'
import Button from '../../components/ui/Button'
import { 
  fetchStudentClassAttendance, 
  fetchStudentClassTestsAndResults,
  fetchStudentClassById,
  fetchTestLeaderboard
} from '../../utils/studentPortal'
import { getSession } from '../../utils/auth'

const CACHE_TIME_12_HOURS = 12 * 60 * 60 * 1000 // 12 hours in milliseconds

const formatDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function StudentCompletedClassDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [activeTab, setActiveTab] = useState('attendance')

  // Selected test for leaderboard modal
  const [selectedTestLeaderboard, setSelectedTestLeaderboard] = useState(null)

  // Query 1: Class details metadata (Cached for 12 hours)
  const { data: classItem, isLoading: classLoading, error: classError } = useQuery({
    queryKey: ['studentCompletedClassItem', id],
    queryFn: async () => {
      const classData = await fetchStudentClassById(id)
      if (!classData || !classData.isComplete) {
        throw new Error('Class not found or is not marked as completed.')
      }
      return classData
    },
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
    enabled: !!id,
  })

  // Query 2: Daily attendance list (Cached for 12 hours)
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['studentCompletedClassAttendance', id],
    queryFn: () => fetchStudentClassAttendance(id),
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
    enabled: !!id && activeTab === 'attendance',
  })

  // Query 3: Tests list and results (Cached for 12 hours)
  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['studentCompletedClassTests', id],
    queryFn: () => fetchStudentClassTestsAndResults(id),
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
    enabled: !!id && activeTab === 'tests',
  })

  // Query 4: Leaderboard for selected test (Cached for 12 hours)
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery({
    queryKey: ['studentCompletedClassTestLeaderboard', selectedTestLeaderboard?.id],
    queryFn: () => fetchTestLeaderboard(selectedTestLeaderboard.id, id),
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
    enabled: !!selectedTestLeaderboard?.id && !!id,
  })

  const session = getSession()
  const currentStudentId = session?.studentId || session?.student?.id

  const loading = classLoading
  const error = classError ? (classError.message || 'Unable to load class details.') : ''

  // Group attendance records by month for summary widgets
  const monthlySummary = useMemo(() => {
    const summary = {}
    attendanceRecords.forEach((record) => {
      const date = new Date(record.attendanceDate)
      if (Number.isNaN(date.getTime())) return
      const monthName = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
      if (!summary[monthName]) {
        summary[monthName] = { present: 0, absent: 0 }
      }
      if (record.status === 'present') {
        summary[monthName].present++
      } else {
        summary[monthName].absent++
      }
    })
    return Object.entries(summary).map(([month, counts]) => ({
      month,
      ...counts,
    }))
  }, [attendanceRecords])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !classItem) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-red-700 shadow-soft">
        <p className="font-semibold">{error || 'Class not found.'}</p>
        <Button variant="secondary" onClick={() => navigate('/student/completed-classes')} className="mt-4 mx-auto">
          Back to Completed Classes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header card banner */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/student/completed-classes')}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {classItem.className}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 font-semibold text-slate-600">
                  {classItem.classLevel}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                  Started {formatDate(classItem.startDate)}
                </span>
                {classItem.classTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[#2563eb]" />
                    {classItem.classTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span className="inline-flex self-start md:self-auto items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-250 px-4 py-2 text-sm font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Completed
          </span>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/80 pb-1 gap-6">
        {[
          { id: 'attendance', label: 'My Attendance' },
          { id: 'tests', label: 'My Test Results' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 text-sm font-bold transition-all duration-200 focus:outline-none ${
                isSelected ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="px-1">{tab.label}</span>
              {isSelected && (
                <span className="absolute bottom-0 left-0 right-0 h-0.75 rounded-t-full bg-blue-600 animate-fade-in" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab 1: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <section className="space-y-6">
          {/* Monthly Summary Widgets */}
          {attendanceLoading ? null : monthlySummary.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {monthlySummary.map((sum) => (
                <div key={sum.month} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <h4 className="text-sm font-bold text-slate-800">{sum.month}</h4>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-emerald-600">{sum.present}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">Days Present</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-red-500">{sum.absent}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">Days Absent</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {attendanceLoading ? (
            <div className="py-12 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : !attendanceRecords.length ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
              No attendance logs found for this completed class.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-soft">
              <div className="divide-y divide-slate-100">
                {attendanceRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-800">
                        {formatDate(record.attendanceDate)}
                      </span>
                    </div>
                    <div>
                      {record.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-150 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-150 px-2.5 py-1 text-xs font-bold text-red-700">
                          <XCircle className="h-3.5 w-3.5" />
                          Absent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: TEST RESULTS */}
      {activeTab === 'tests' && (
        <section className="space-y-4">
          {testsLoading ? (
            <div className="py-12 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : !tests.length ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
              No test records found for this completed class.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tests.map((test) => {
                const isAbsent = test.absent
                const isGraded = test.marks !== null

                return (
                  <article 
                    key={test.id} 
                    onClick={() => setSelectedTestLeaderboard(test)}
                    className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-350"
                  >
                    <div className="flex items-start gap-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 ${
                        isAbsent 
                          ? 'bg-red-50 text-red-500' 
                          : isGraded 
                          ? 'bg-emerald-50 text-emerald-500' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {isAbsent ? (
                          <XCircle className="h-5 w-5" />
                        ) : isGraded ? (
                          <Trophy className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {test.testName}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Subject: {test.subject}</p>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Date: {formatDate(test.testDate)}</p>

                        <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Total Marks: {test.totalMarks}</span>
                          <div>
                            {isAbsent ? (
                              <span className="text-xs font-bold text-red-600">Absent</span>
                            ) : isGraded ? (
                              <span className="text-sm font-extrabold text-emerald-600">
                                Obtained: {test.marks}
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-400 italic">Not Graded</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Ranked Test Results Leaderboard Modal */}
      {selectedTestLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2563eb]">
                  Class Leaderboard
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 truncate max-w-[20rem] sm:max-w-[28rem]">
                  {selectedTestLeaderboard.testName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTestLeaderboard.subject} • Total Marks: {selectedTestLeaderboard.totalMarks}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTestLeaderboard(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 min-h-0 max-h-[45vh] md:max-h-[50vh]">
              {leaderboardLoading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-50 border border-slate-100" />
                ))
              ) : leaderboard.length ? (
                leaderboard.map((student) => {
                  const isCurrent = student.studentId === currentStudentId
                  return (
                    <div
                      key={student.studentId}
                      className={[
                        'flex items-center justify-between rounded-2xl border px-4 py-3 transition',
                        isCurrent
                          ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                          : 'border-slate-100 bg-white hover:border-slate-200',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Position Indicator */}
                        <div className="w-8 flex justify-center text-sm font-bold text-slate-500">
                          {student.isAbsent ? (
                            <span className="text-xs text-slate-400 font-medium">N/A</span>
                          ) : student.position === 1 ? (
                            <span className="text-lg">🥇</span>
                          ) : student.position === 2 ? (
                            <span className="text-lg">🥈</span>
                          ) : student.position === 3 ? (
                            <span className="text-lg">🥉</span>
                          ) : (
                            <span>#{student.position}</span>
                          )}
                        </div>

                        {/* Student Avatar */}
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-slate-400">
                              {student.name[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Student Name */}
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${isCurrent ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'}`}>
                            {student.name} {isCurrent && <span className="text-xs font-normal text-blue-600">(You)</span>}
                          </p>
                        </div>
                      </div>

                      {/* Marks */}
                      <div className="text-right shrink-0 pl-3">
                        {student.isAbsent ? (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                            Absent
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-slate-900">
                            {student.marks} / {selectedTestLeaderboard.totalMarks}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-6 text-center text-sm text-slate-400">
                  No leaderboard records.
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
              <Button variant="secondary" onClick={() => setSelectedTestLeaderboard(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentCompletedClassDetails
