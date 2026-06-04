import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import AttendanceCard from '../../components/teacher-attendance/AttendanceCard'
import AttendanceRow from '../../components/teacher-attendance/AttendanceRow'
import DateSelector from '../../components/teacher-attendance/DateSelector'
import EmptyState from '../../components/teacher-attendance/EmptyState'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import FilterTabs from '../../components/teacher-classes/FilterTabs'
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
  const queryClient = useQueryClient()
  const [selectedClassId, setSelectedClassId] = useState('')
  const [statuses, setStatuses] = useState({})
  const [attendanceDate, setAttendanceDate] = useState(getTodayDateValue())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('save')
  const [classFilter, setClassFilter] = useState('All')

  const { data: classes = [], isLoading: loadingClasses, error: classesQueryError } = useQuery({
    queryKey: ['attendanceClasses'],
    queryFn: fetchAttendanceClasses,
    staleTime: 2 * 60 * 60 * 1000,
  })

  const { data: attendanceData, isLoading: loadingAttendance, error: attendanceQueryError } = useQuery({
    queryKey: ['attendanceClassDetail', selectedClassId, attendanceDate],
    queryFn: async () => {
      const [classData, classStudents, attendanceRecords] = await Promise.all([
        fetchAttendanceClass(selectedClassId),
        fetchAttendanceClassStudents(selectedClassId),
        fetchAttendanceRecords(selectedClassId, attendanceDate),
      ])
      return { classData, classStudents, attendanceRecords }
    },
    enabled: !!selectedClassId,
    staleTime: 2 * 60 * 60 * 1000,
  })

  useEffect(() => {
    if (attendanceData) {
      setStatuses(buildInitialStatuses(attendanceData.classStudents, attendanceData.attendanceRecords))
      setMode(attendanceData.attendanceRecords.length ? 'update' : 'save')
    }
  }, [attendanceData])

  const selectedClass = attendanceData?.classData || null
  const students = attendanceData?.classStudents || []

  const filteredClasses = useMemo(() => {
    return classes.filter(
      (classItem) => classFilter === 'All' || classItem.classLevel === classFilter,
    )
  }, [classFilter, classes])

  const handleClassSelect = (classItem) => {
    setSelectedClassId(classItem.id)
    setStatuses({})
    setError('')
    setMode('save')
  }

  const handleBack = () => {
    setSelectedClassId('')
    setStatuses({})
    setError('')
    setMode('save')
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
      queryClient.invalidateQueries({ queryKey: ['attendanceClassDetail', selectedClassId, attendanceDate] })
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
        <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Attendance
          </h1>
        </section>

        <SectionCard title="Filter classes" subtitle="Class-wise view">
          <FilterTabs
            value={classFilter}
            options={['All', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG']}
            onChange={setClassFilter}
          />
        </SectionCard>

        {filteredClasses.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredClasses.map((classItem) => (
              <AttendanceCard
                key={classItem.id}
                classItem={classItem}
                onClick={handleClassSelect}
              />
            ))}
          </div>
        ) : classes.length ? (
          <EmptyState
            title="No classes match your filters"
            onBack={() => setClassFilter('All')}
            actionLabel="Reset Filter"
          />
        ) : (
          <EmptyState
            title="No classes available for attendance"
            onBack={() => navigate('/teacher/classes')}
            actionLabel="Back to Classes"
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {selectedClass.className || 'Class'}
          </h1>

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
      </section>

      {error ? (
        <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 shadow-soft">
          {error}
        </div>
      ) : null}

      {loadingAttendance ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-soft"
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
