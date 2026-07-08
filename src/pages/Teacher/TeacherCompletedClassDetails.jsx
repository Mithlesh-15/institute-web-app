import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserCircle2, CalendarDays, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import { fetchClassById, fetchClassStudents } from '../../utils/classesManagement'
import { fetchAttendanceRecords, getTodayDateValue } from '../../utils/attendanceManagement'
import { fetchClassTests, fetchTestDetails } from '../../utils/teacherPortal'

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

const getInitials = (name = 'Student') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function TeacherCompletedClassDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [activeTab, setActiveTab] = useState('students')

  // Attendance date filter
  const [attendanceDate, setAttendanceDate] = useState(getTodayDateValue())

  // Test details modal states
  const [selectedTest, setSelectedTest] = useState(null)
  const [testModalOpen, setTestModalOpen] = useState(false)

  // Query 1: Class, students, and tests (Cached for 12 hours)
  const { data: detailsData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['completedClassDetail', id],
    queryFn: async () => {
      const [classData, studentData, testData] = await Promise.all([
        fetchClassById(id),
        fetchClassStudents(id),
        fetchClassTests(id),
      ])

      if (!classData || !classData.isComplete) {
        throw new Error('Class not found or is not marked as completed.')
      }

      return { classItem: classData, students: studentData, tests: testData }
    },
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
    enabled: !!id,
  })

  // Query 2: Daily attendance records (Cached for 12 hours)
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['completedClassAttendance', id, attendanceDate],
    queryFn: () => fetchAttendanceRecords(id, attendanceDate),
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
    enabled: !!id && activeTab === 'attendance',
  })

  // Query 3: Specific test score sheets (Cached for 12 hours)
  const { data: testDetails, isLoading: testDetailsLoading } = useQuery({
    queryKey: ['completedClassTestDetails', selectedTest?.id],
    queryFn: () => fetchTestDetails(selectedTest.id),
    staleTime: CACHE_TIME_12_HOURS,
    gcTime: CACHE_TIME_12_HOURS,
    enabled: !!selectedTest?.id,
  })

  // Extracted values
  const classItem = detailsData?.classItem || null
  const students = detailsData?.students || []
  const tests = detailsData?.tests || []
  const error = queryError ? (queryError.message || 'Unable to load class details.') : ''

  // Map attendance records
  const attendanceMap = useMemo(() => {
    return new Map(attendanceRecords.map((r) => [r.studentId, r.status]))
  }, [attendanceRecords])

  const handleOpenTestDetails = (test) => {
    setSelectedTest(test)
    setTestModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !classItem) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <p className="font-semibold">{error || 'Class not found.'}</p>
        <Button variant="secondary" onClick={() => navigate('/teacher/completed-classes')} className="mt-4 mx-auto">
          Back to Completed Classes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/teacher/completed-classes')}
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

          <span className="inline-flex self-start md:self-auto items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Status: Completed
          </span>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/80 pb-1 gap-6">
        {[
          { id: 'students', label: 'Students', count: students.length },
          { id: 'attendance', label: 'Attendance', count: null },
          { id: 'tests', label: 'Tests', count: tests.length },
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
              <div className="flex items-center gap-2 px-1">
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
              {isSelected && (
                <span className="absolute bottom-0 left-0 right-0 h-0.75 rounded-t-full bg-blue-600 animate-fade-in" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab 1: STUDENTS */}
      {activeTab === 'students' && (
        <section className="space-y-4">
          {!students.length ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No students were assigned to this class.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {students.map((student) => {
                const initials = getInitials(student.name)
                return (
                  <article key={student.id} className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shrink-0">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-blue-600 bg-blue-50">
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-bold text-slate-800">
                          {student.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Phone: {student.phone || 'N/A'}</p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Admitted: {formatDate(student.createdAt)}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <SectionCard 
          title="Attendance History" 
          subtitle="Select date to review daily status log"
          action={
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600 transition"
            />
          }
        >
          {attendanceLoading ? (
            <div className="py-12 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : !students.length ? (
            <div className="py-6 text-center text-sm text-slate-400">
              No students assigned to mark attendance.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              <div className="divide-y divide-slate-100">
                {students.map((student) => {
                  const status = attendanceMap.get(student.id)
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <UserCircle2 className="h-5 w-5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-800">{student.name}</span>
                      </div>
                      <div>
                        {status === 'present' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-150">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Present
                          </span>
                        ) : status === 'absent' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-150">
                            <XCircle className="h-3.5 w-3.5" />
                            Absent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-400 border border-slate-200">
                            Not Marked
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Tab 3: TESTS */}
      {activeTab === 'tests' && (
        <section className="space-y-4">
          {!tests.length ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No tests were recorded for this class.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tests.map((test) => (
                <article
                  key={test.id}
                  onClick={() => handleOpenTestDetails(test)}
                  className="group cursor-pointer overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-350"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {test.testName}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Subject: {test.subject}</p>
                      <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
                        <span>Total: {test.totalMarks} Marks</span>
                        <span>Date: {formatDate(test.testDate)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Read-only Test Details Modal */}
      {selectedTest && (
        <Modal
          open={testModalOpen}
          title={selectedTest.testName}
          description={`Subject: ${selectedTest.subject} | Date: ${formatDate(selectedTest.testDate)} | Total Marks: ${selectedTest.totalMarks}`}
          onClose={() => {
            setTestModalOpen(false)
            setSelectedTest(null)
          }}
          size="md"
        >
          {testDetailsLoading ? (
            <div className="py-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !testDetails ? (
            <div className="py-6 text-center text-sm text-red-500">
              Failed to load test details.
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Student Scoreboard (Read-Only)</h3>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 font-bold">
                      <th className="p-3">Student Name</th>
                      <th className="p-3 text-right">Marks / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {testDetails.students.map((student) => {
                      const hasResult = !!student.result
                      const isAbsent = student.result?.absent

                      return (
                        <tr key={student.id} className="hover:bg-slate-100/30 transition-colors">
                          <td className="p-3 font-semibold text-slate-800">{student.name}</td>
                          <td className="p-3 text-right">
                            {isAbsent ? (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-150">
                                Absent
                              </span>
                            ) : hasResult && student.result.marks !== null ? (
                              <span className="font-extrabold text-slate-850">
                                {student.result.marks} <span className="text-slate-400 font-normal">/ {selectedTest.totalMarks}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Not Graded</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setTestModalOpen(false)
                    setSelectedTest(null)
                  }}
                >
                  Close View
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

export default TeacherCompletedClassDetails
