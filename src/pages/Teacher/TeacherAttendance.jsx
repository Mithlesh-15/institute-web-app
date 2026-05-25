import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarCheck2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import AttendanceCard from '../../components/teacher-attendance/AttendanceCard'
import AttendanceRow from '../../components/teacher-attendance/AttendanceRow'
import AttendanceSummary from '../../components/teacher-attendance/AttendanceSummary'
import DateSelector from '../../components/teacher-attendance/DateSelector'
import EmptyState from '../../components/teacher-attendance/EmptyState'
import {
  fetchAttendanceClasses,
  fetchAttendanceClass,
  fetchAttendanceClassStudents,
  fetchAttendanceRecords,
  getTodayDateValue,
  saveAttendanceRecords,
} from '../../utils/attendanceManagement'

const buildInitialStatuses = (students, attendanceRecords) => {
  const recordMap = new Map(
    (attendanceRecords || []).map((record) => [record.studentId, record.status]),
  )

  return students.reduce((accumulator, student) => {
    accumulator[student.id] = recordMap.get(student.id) || 'present'
    return accumulator
  }, {})
}

function TeacherAttendance() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [statuses, setStatuses] = useState({})
  const [attendanceDate, setAttendanceDate] = useState(getTodayDateValue())
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('save')
  const [loadedDateKey, setLoadedDateKey] = useState('')

  useEffect(() => {
    let mounted = true

    const loadClasses = async () => {
      try {
        setLoadingClasses(true)
        setError('')
        const data = await fetchAttendanceClasses()

        if (mounted) {
          setClasses(data)
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load attendance classes.',
          )
        }
      } finally {
        if (mounted) {
          setLoadingClasses(false)
        }
      }
    }

    loadClasses()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedClass) {
      return
    }

    let mounted = true
    const loadAttendance = async () => {
      try {
        setLoadingAttendance(true)
        setError('')

        const [classData, classStudents, attendanceRecords] = await Promise.all([
          fetchAttendanceClass(selectedClass.id),
          fetchAttendanceClassStudents(selectedClass.id),
          fetchAttendanceRecords(selectedClass.id, attendanceDate),
        ])

        if (!mounted) {
          return
        }

        setSelectedClass(classData)
        setStudents(classStudents)
        setStatuses(buildInitialStatuses(classStudents, attendanceRecords))
        setMode(attendanceRecords.length ? 'update' : 'save')
        setLoadedDateKey(`${selectedClass.id}-${attendanceDate}`)
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load attendance records.',
          )
        }
      } finally {
        if (mounted) {
          setLoadingAttendance(false)
        }
      }
    }

    loadAttendance()

    return () => {
      mounted = false
    }
  }, [attendanceDate, selectedClass?.id])

  const totalStudents = students.length

  const presentCount = useMemo(
    () => Object.values(statuses).filter((status) => status === 'present').length,
    [statuses],
  )

  const absentCount = useMemo(
    () => Object.values(statuses).filter((status) => status === 'absent').length,
    [statuses],
  )

  const handleClassSelect = (classItem) => {
    setSelectedClass(classItem)
    setStatuses({})
    setStudents([])
    setError('')
    setMode('save')
    setLoadedDateKey('')
  }

  const handleBack = () => {
    setSelectedClass(null)
    setStudents([])
    setStatuses({})
    setError('')
    setMode('save')
    setLoadedDateKey('')
  }

  const handleStatusChange = (studentId, status) => {
    setStatuses((current) => ({
      ...current,
      [studentId]: status,
    }))
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await saveAttendanceRecords(selectedClass.id, attendanceDate, statuses)
      setMode('update')
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save attendance right now.',
      )
    } finally {
      setSaving(false)
    }
  }

  const attendanceButtonLabel = mode === 'update' ? 'Update Attendance' : 'Save Attendance'

  if (loadingClasses) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
          />
        ))}
      </div>
    )
  }

  if (!selectedClass) {
    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(242,93,13,0.06))] p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                  <CalendarCheck2 className="h-3.5 w-3.5 text-[#2563eb]" />
                  Attendance management
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Attendance
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Select a class to mark present and absent records for today or any past date.
                </p>
              </div>
            </div>
          </div>
        </section>

        {classes.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {classes.map((classItem) => (
              <AttendanceCard
                key={classItem.id}
                classItem={classItem}
                onClick={handleClassSelect}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No classes available for attendance"
            description="Create a class first, then you can manage attendance from here."
            onBack={() => navigate('/teacher/classes')}
            actionLabel="Back to Classes"
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(242,93,13,0.06))] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#2563eb]/20 hover:text-[#2563eb]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Classes
              </button>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <CalendarCheck2 className="h-3.5 w-3.5 text-[#2563eb]" />
                Attendance for {attendanceDate}
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {selectedClass.className || 'Class'}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                  Class {selectedClass.classLevel || 'N/A'}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  {totalStudents} total students
                </span>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-[#f25d0d]">
                  {loadedDateKey ? mode.toUpperCase() : 'READY'}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[24rem]">
              <DateSelector
                value={attendanceDate}
                onChange={(event) => setAttendanceDate(event.target.value)}
              />
              <Button
                onClick={handleSaveAttendance}
                loading={saving}
                loadingLabel="Saving attendance..."
                className="hidden lg:inline-flex"
              >
                {mode === 'update' ? 'Update Attendance' : 'Save Attendance'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AttendanceSummary
        totalStudents={totalStudents}
        presentCount={presentCount}
        absentCount={absentCount}
      />

      {error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : null}

      {loadingAttendance ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : students.length ? (
        <div className="grid gap-4">
          {students.map((student) => (
            <AttendanceRow
              key={student.id}
              student={student}
              status={statuses[student.id] || 'present'}
              onChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No students in this class"
          description="Assign students to this class first, then attendance can be marked here."
          onBack={handleBack}
          actionLabel="Back to Classes"
        />
      )}

      <div className="sticky bottom-4 z-20 lg:hidden">
        <Button
          fullWidth
          onClick={handleSaveAttendance}
          loading={saving}
          loadingLabel="Saving attendance..."
          className="shadow-[0_18px_40px_rgba(37,99,235,0.22)]"
        >
          {attendanceButtonLabel}
        </Button>
      </div>
    </div>
  )
}

export default TeacherAttendance
