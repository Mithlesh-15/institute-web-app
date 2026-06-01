import { useState } from 'react'
import { Award, X, Trophy, Calendar, BookOpen, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getSession } from '../../utils/auth'
import { fetchStudentTests, fetchTestLeaderboard, formatPortalDate } from '../../utils/studentPortal'

function StudentResults() {
  const [selectedTest, setSelectedTest] = useState(null)

  // 1. Fetch all tests for classes the student is in
  const { data: tests = [], isLoading: loadingTests, error: testsError } = useQuery({
    queryKey: ['studentTests'],
    queryFn: fetchStudentTests,
    staleTime: 5 * 60 * 60 * 1000, // 5 hours cache
    gcTime: 5 * 60 * 60 * 1000,
  })

  // 2. Fetch leaderboard of the selected test
  const { data: leaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ['testLeaderboard', selectedTest?.id, selectedTest?.class_id],
    queryFn: () => fetchTestLeaderboard(selectedTest.id, selectedTest.class_id),
    enabled: !!selectedTest,
    staleTime: 5 * 60 * 60 * 1000, // 5 hours cache
    gcTime: 5 * 60 * 60 * 1000,
  })

  const session = getSession()
  const currentStudentId = session?.studentId || session?.student?.id

  // Find current student's score in the active leaderboard
  const currentStudentDetail = leaderboard.find((item) => item.studentId === currentStudentId)

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Academic Performance
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Test Results</h1>
            <p className="text-sm text-slate-500 mt-1">View your scores, rankings, and class performance charts.</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb]">
            <Award className="h-7 w-7" />
          </div>
        </div>
      </section>

      {/* Tests Grid */}
      {loadingTests ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : testsError ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{testsError.message || 'Unable to load test results right now.'}</span>
        </div>
      ) : tests.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => setSelectedTest(test)}
              className="w-full text-left group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-[#2563eb]/20 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3 min-w-0">
                  <div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {test.subject || 'Subject'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {test.test_name}
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatPortalDate(test.test_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>Total Marks: {test.total_marks}</span>
                    </div>
                  </div>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#2563eb] transition">
                  <Trophy className="h-4.5 w-4.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No tests scheduled or completed for your batches yet.
        </div>
      )}

      {/* Leaderboard Modal */}
      {selectedTest ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#2563eb]">
                  Class Leaderboard
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 truncate max-w-[20rem] sm:max-w-[28rem]">
                  {selectedTest.test_name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTest.subject} • Total Marks: {selectedTest.total_marks}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Leaderboard List */}
            <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1 min-h-0">
              {loadingLeaderboard ? (
                [...Array(5)].map((_, index) => (
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
                            {student.marks} / {selectedTest.total_marks}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 text-sm text-slate-400">
                  No records uploaded for this test.
                </div>
              )}
            </div>

            {/* Current Student Highlight Sticky Bar */}
            {currentStudentDetail && (
              <div className="mt-4 border-t border-slate-200 pt-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 -mx-6 -mb-6 p-6 rounded-b-[1.75rem] sticky bottom-0 z-10 shadow-[0_-12px_30px_rgba(0,0,0,0.06)] border-t border-blue-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2563eb]">Your Result Details</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-blue-200 bg-white">
                      {currentStudentDetail.photo ? (
                        <img src={currentStudentDetail.photo} alt={currentStudentDetail.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[#2563eb]">
                          {currentStudentDetail.name[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{currentStudentDetail.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {currentStudentDetail.isAbsent ? 'Absent' : `Rank Position: #${currentStudentDetail.position}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {currentStudentDetail.isAbsent ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                        Absent
                      </span>
                    ) : (
                      <p className="text-lg font-black text-[#2563eb]">
                        {currentStudentDetail.marks} <span className="text-xs font-medium text-slate-400">/ {selectedTest.total_marks}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default StudentResults
