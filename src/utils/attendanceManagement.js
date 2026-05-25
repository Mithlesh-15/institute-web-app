import { supabase } from './supabase'
import { fetchClassesWithStudentCounts, fetchClassById, fetchClassStudents } from './classesManagement'

const ATTENDANCE_TABLE = 'attendance'

const normalizeText = (value) => String(value || '').trim()

const normalizeDateValue = (value) => {
  if (!value) {
    return ''
  }

  if (typeof value === 'string' && value.length >= 10) {
    return value.slice(0, 10)
  }

  return new Date(value).toISOString().slice(0, 10)
}

export const ATTENDANCE_STATUS_OPTIONS = ['present', 'absent']

export const normalizeAttendanceRecord = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    classId: row.class_id || row.classId || '',
    studentId: row.student_id || row.studentId || '',
    attendanceDate: normalizeDateValue(row.attendance_date || row.attendanceDate),
    status: normalizeText(row.status),
    createdAt: row.created_at || row.createdAt || null,
  }
}

export const getTodayDateValue = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export async function fetchAttendanceClasses() {
  return fetchClassesWithStudentCounts()
}

export async function fetchAttendanceClass(classId) {
  return fetchClassById(classId)
}

export async function fetchAttendanceClassStudents(classId) {
  return fetchClassStudents(classId)
}

export async function fetchAttendanceRecords(classId, attendanceDate) {
  const { data, error } = await supabase
    .from(ATTENDANCE_TABLE)
    .select('*')
    .eq('class_id', classId)
    .eq('attendance_date', normalizeDateValue(attendanceDate))

  if (error) {
    throw new Error(error.message || 'Unable to load attendance records.')
  }

  return (data || []).map(normalizeAttendanceRecord).filter(Boolean)
}

export async function saveAttendanceRecords(classId, attendanceDate, studentStatuses) {
  const attendanceDateValue = normalizeDateValue(attendanceDate)
  const uniqueRows = Object.entries(studentStatuses || {}).reduce((rows, [studentId, status]) => {
    const normalizedStatus = normalizeText(status)

    if (!studentId || !ATTENDANCE_STATUS_OPTIONS.includes(normalizedStatus)) {
      return rows
    }

    rows.push({
      class_id: classId,
      student_id: studentId,
      attendance_date: attendanceDateValue,
      status: normalizedStatus,
    })

    return rows
  }, [])

  if (!uniqueRows.length) {
    return { savedCount: 0 }
  }

  const { error } = await supabase
    .from(ATTENDANCE_TABLE)
    .upsert(uniqueRows, {
      onConflict: 'class_id,student_id,attendance_date',
    })

  if (error) {
    throw new Error(error.message || 'Unable to save attendance.')
  }

  return { savedCount: uniqueRows.length }
}
