import { supabase } from './supabase'
import { getSession, saveSession } from './auth'

const STUDENTS_TABLE = 'students'
const CLASSES_TABLE = 'classes'
const BATCH_STUDENTS_TABLE = 'batch_students'
const ATTENDANCE_TABLE = 'attendance'
const FEES_TABLE = 'fees'
const NOTICES_TABLE = 'notices'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const normalizeText = (value) => String(value || '').trim()

const normalizeSubjects = (subjects) =>
  Array.isArray(subjects)
    ? [...new Set(subjects.map((subject) => normalizeText(subject)).filter(Boolean))]
    : []

const normalizeDateValue = (value) => {
  if (!value) {
    return ''
  }

  if (typeof value === 'string' && value.length >= 10) {
    return value.slice(0, 10)
  }

  return new Date(value).toISOString().slice(0, 10)
}

const getStudentSession = () => {
  const session = getSession()

  if (!session?.token || session.role !== 'student' || !session.studentId) {
    throw new Error('Student session not found. Please log in again.')
  }

  return session
}

const getMonthIndex = (month) =>
  MONTH_NAMES.findIndex(
    (monthName) => monthName.toLowerCase() === normalizeText(month).toLowerCase(),
  )

const getCurrentMonthRange = () => {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  return {
    start: normalizeDateValue(monthStart),
    end: normalizeDateValue(monthEnd),
  }
}

const getCurrentMonthYear = () => {
  const today = new Date()
  return {
    month: MONTH_NAMES[today.getMonth()],
    year: today.getFullYear(),
  }
}

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

export const formatPortalDate = (value, options = {}) => {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export const formatPortalCurrency = formatCurrency

export const normalizeStudentProfile = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: normalizeText(row.name),
    className: normalizeText(row.class || row.className),
    photo: row.photo || '',
    phone: normalizeText(row.phone),
    fatherName: normalizeText(row.father_name),
    schoolName: normalizeText(row.school_name),
    address: normalizeText(row.address),
    board: normalizeText(row.board),
    medium: normalizeText(row.medium),
  }
}

export const formatPortalTime = (value) => {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  // Check if it has a valid date representation. If it is just a time string, return it.
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch (e) {
    return value
  }
}

export const normalizePortalClass = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    className: normalizeText(row.class_name || row.className),
    classType: normalizeText(row.class || row.classType || row.classLevel),
    startDate: normalizeDateValue(row.start_date || row.startDate),
    classTime: row.Time || row.classTime || '',
  }
}

export const normalizePortalAttendance = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    classId: row.class_id || row.classId || '',
    studentId: row.student_id || row.studentId || '',
    attendanceDate: normalizeDateValue(row.attendance_date || row.attendanceDate),
    status: normalizeText(row.status).toLowerCase(),
  }
}

export const normalizePortalFee = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    studentId: row.student_id || row.studentId || '',
    month: normalizeText(row.month),
    year: Number(row.year || 0),
    status: normalizeText(row.status).toLowerCase(),
    pendingAmount: Number(row.pending_amount || row.pendingAmount || 0),
    paymentDate: row.payment_date || null,
  }
}

export const normalizePortalNotice = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    title: normalizeText(row.title),
    noticeLink: normalizeText(row.link),
  }
}

const syncStudentSession = (profile) => {
  const session = getSession()

  if (!session?.token || session.role !== 'student') {
    return
  }

  saveSession({
    ...session,
    displayName: profile.name || session.displayName,
    className: profile.className || session.className,
    photo: profile.photo || session.photo || '',
    student: {
      ...(session.student || {}),
      ...profile,
    },
  })
}

export async function fetchStudentProfile() {
  const session = getStudentSession()
  const { data, error } = await supabase
    .from(STUDENTS_TABLE)
    .select('*')
    .eq('id', session.studentId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Unable to load student profile.')
  }

  const profile = normalizeStudentProfile(data)

  if (!profile) {
    throw new Error('Student profile not found.')
  }

  syncStudentSession(profile)
  return profile
}

export async function updateStudentProfile({
  name,
  className,
  fatherName,
  schoolName,
  address,
  board,
  medium,
}) {
  const session = getStudentSession()
  const payload = {
    name: normalizeText(name).toUpperCase(),
    class: normalizeText(className),
    father_name: normalizeText(fatherName).toUpperCase(),
    school_name: normalizeText(schoolName),
    address: normalizeText(address),
    board: normalizeText(board),
    medium: normalizeText(medium),
  }

  if (!payload.name) {
    throw new Error('Please enter the student name.')
  }

  if (!payload.class) {
    throw new Error('Please select the current class.')
  }

  const { data, error } = await supabase
    .from(STUDENTS_TABLE)
    .update(payload)
    .eq('id', session.studentId)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to update profile.')
  }

  const profile = normalizeStudentProfile(data)
  syncStudentSession(profile)
  return profile
}

export async function fetchStudentClasses() {
  const session = getStudentSession()
  const { data: joinedRows, error: joinError } = await supabase
    .from(BATCH_STUDENTS_TABLE)
    .select('class_id')
    .eq('student_id', session.studentId)

  if (joinError) {
    throw new Error(joinError.message || 'Unable to load student classes.')
  }

  const assignments = (joinedRows || []).filter((row) => row.class_id)

  if (!assignments.length) {
    return []
  }

  const classIds = assignments.map((row) => row.class_id)
  const { data: classRows, error: classError } = await supabase
    .from(CLASSES_TABLE)
    .select('*')
    .in('id', classIds)

  if (classError) {
    throw new Error(classError.message || 'Unable to load class details.')
  }

  const classMap = new Map(
    (classRows || [])
      .map((row) => normalizePortalClass(row))
      .filter(Boolean)
      .map((classItem) => [classItem.id, classItem]),
  )

  return assignments
    .map((assignment) => {
      const classItem = classMap.get(assignment.class_id)

      if (!classItem) {
        return null
      }

      return {
        ...classItem,
        joinedAt: classItem.startDate,
      }
    })
    .filter(Boolean)
    .sort((first, second) => {
      if (first.startDate && second.startDate) {
        return first.startDate < second.startDate ? 1 : -1
      }

      return first.className.localeCompare(second.className)
    })
}

export async function fetchStudentAttendanceData() {
  const session = getStudentSession()
  const [classes, studentResult] = await Promise.all([
    fetchStudentClasses(),
    supabase.from(STUDENTS_TABLE).select('created_at').eq('id', session.studentId).maybeSingle()
  ])

  const student = studentResult?.data
  const admissionDateStr = student?.created_at ? (typeof student.created_at === 'string' ? student.created_at.slice(0, 10) : new Date(student.created_at).toISOString().slice(0, 10)) : ''

  if (!classes.length) {
    return {
      classes: [],
      currentMonthAttendancePercentage: 0,
    }
  }

  const classIds = classes.map((classItem) => classItem.id)
  const { data, error } = await supabase
    .from(ATTENDANCE_TABLE)
    .select('*')
    .eq('student_id', session.studentId)
    .in('class_id', classIds)
    .order('attendance_date', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load attendance.')
  }

  let records = (data || []).map(normalizePortalAttendance).filter(Boolean)
  if (admissionDateStr) {
    records = records.filter((record) => record.attendanceDate >= admissionDateStr)
  }

  const historyByClass = records.reduce((accumulator, record) => {
    if (!accumulator[record.classId]) {
      accumulator[record.classId] = []
    }

    accumulator[record.classId].push(record)
    return accumulator
  }, {})

  const { start, end } = getCurrentMonthRange()
  const currentMonthRecords = records.filter(
    (record) => record.attendanceDate >= start && record.attendanceDate <= end,
  )
  const presentThisMonth = currentMonthRecords.filter((record) => record.status === 'present').length
  const currentMonthAttendancePercentage = currentMonthRecords.length
    ? Math.round((presentThisMonth / currentMonthRecords.length) * 100)
    : 0

  return {
    currentMonthAttendancePercentage,
    classes: classes.map((classItem) => {
      const history = (historyByClass[classItem.id] || []).sort((first, second) =>
        first.attendanceDate < second.attendanceDate ? 1 : -1,
      )
      const presentCount = history.filter((record) => record.status === 'present').length
      const absentCount = history.filter((record) => record.status === 'absent').length
      const totalCount = history.length
      const percentage = totalCount ? Math.round((presentCount / totalCount) * 100) : 0

      return {
        ...classItem,
        presentCount,
        absentCount,
        totalCount,
        percentage,
        history,
      }
    }),
  }
}

export async function fetchStudentFees() {
  const session = getStudentSession()
  const currentMonthYear = getCurrentMonthYear()

  // 1. Fetch student's current total_fees from database to be absolutely accurate
  const { data: studentData, error: studentError } = await supabase
    .from(STUDENTS_TABLE)
    .select('total_fees')
    .eq('id', session.studentId)
    .maybeSingle()

  if (studentError) {
    throw new Error(studentError.message || 'Unable to load student details for fees.')
  }

  const totalFees = Number(studentData?.total_fees || 0)

  // 2. Check if the fee record for the current month and year already exists
  const { data: feeData, error: feeError } = await supabase
    .from(FEES_TABLE)
    .select('id')
    .eq('student_id', session.studentId)
    .eq('month', currentMonthYear.month)
    .eq('year', String(currentMonthYear.year))
    .maybeSingle()

  if (feeError) {
    throw new Error(feeError.message || 'Unable to check current month fee status.')
  }

  // 3. If it doesn't exist, create it automatically
  if (!feeData) {
    const { error: insertError } = await supabase
      .from(FEES_TABLE)
      .insert({
        student_id: session.studentId,
        month: currentMonthYear.month,
        year: String(currentMonthYear.year),
        status: 'pending',
        pending_amount: totalFees,
      })

    if (insertError) {
      if (!insertError.message.toLowerCase().includes('unique_student_month_fee')) {
        throw new Error(insertError.message || 'Unable to create current month fee record.')
      }
    }
  }

  // 4. Fetch and return all fee records
  const { data, error } = await supabase
    .from(FEES_TABLE)
    .select('*')
    .eq('student_id', session.studentId)

  if (error) {
    throw new Error(error.message || 'Unable to load fees.')
  }

  return (data || [])
    .map(normalizePortalFee)
    .filter(Boolean)
    .sort((first, second) => {
      if (first.year !== second.year) {
        return second.year - first.year
      }

      return getMonthIndex(second.month) - getMonthIndex(first.month)
    })
}

export async function fetchStudentNotices() {
  const { data, error } = await supabase
    .from(NOTICES_TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    const message = error.message || 'Unable to load notices.'

    if (
      message.toLowerCase().includes('not exist') ||
      message.toLowerCase().includes('relation') ||
      message.toLowerCase().includes('schema cache')
    ) {
      return []
    }

    throw new Error(message)
  }

  return (data || []).map(normalizePortalNotice).filter(Boolean)
}

export async function fetchStudentDashboardData() {
  const [profile, classes, attendance, fees, notices] = await Promise.all([
    fetchStudentProfile(),
    fetchStudentClasses(),
    fetchStudentAttendanceData(),
    fetchStudentFees(),
    fetchStudentNotices(),
  ])

  const totalPendingAmount = fees.reduce((total, fee) => {
    if (fee.status !== 'pending') {
      return total
    }

    return total + Number(fee.pendingAmount || 0)
  }, 0)

  return {
    profile,
    classes,
    notices,
    attendanceClasses: attendance.classes,
    stats: {
      currentMonthAttendancePercentage: attendance.currentMonthAttendancePercentage,
      totalPendingAmount,
      totalJoinedClasses: classes.length,
    },
  }
}

export async function fetchStudentTests() {
  const session = getStudentSession()
  const classes = await fetchStudentClasses()
  if (!classes.length) {
    return []
  }

  const classIds = classes.map((c) => c.id)

  const { data: tests, error: testsError } = await supabase
    .from('tests')
    .select('*')
    .in('class_id', classIds)
    .order('test_date', { ascending: false })

  if (testsError) {
    throw new Error(testsError.message || 'Unable to load tests.')
  }

  return tests || []
}

export async function fetchTestLeaderboard(testId, classId) {
  const { data: assignments, error: assignmentsError } = await supabase
    .from(BATCH_STUDENTS_TABLE)
    .select('student_id')
    .eq('class_id', classId)

  if (assignmentsError) {
    throw new Error(assignmentsError.message || 'Unable to load students for this class.')
  }

  const studentIds = (assignments || []).map((row) => row.student_id).filter(Boolean)

  if (!studentIds.length) {
    return []
  }

  const { data: studentRows, error: studentError } = await supabase
    .from('students')
    .select('id, name, photo')
    .in('id', studentIds)

  if (studentError) {
    throw new Error(studentError.message || 'Unable to load student profiles.')
  }

  const { data: resultRows, error: resultError } = await supabase
    .from('test_results')
    .select('*')
    .eq('test_id', testId)

  if (resultError) {
    throw new Error(resultError.message || 'Unable to load test results.')
  }

  const resultsMap = new Map(
    (resultRows || []).map((row) => [row.student_id, row])
  )

  const leaderboard = studentRows.map((student) => {
    const res = resultsMap.get(student.id)
    return {
      studentId: student.id,
      name: student.name,
      photo: student.photo || '',
      marks: res ? Number(res.marks || 0) : 0,
      isAbsent: res ? Boolean(res.is_absent) : true,
    }
  })

  const presentStudents = leaderboard.filter(s => !s.isAbsent).sort((a, b) => b.marks - a.marks)
  const absentStudents = leaderboard.filter(s => s.isAbsent)

  const rankedPresent = presentStudents.map((student, index) => {
    return {
      ...student,
      position: index + 1
    }
  })

  return [...rankedPresent, ...absentStudents.map(s => ({ ...s, position: null }))]
}

export async function fetchStudentMaterials() {
  const session = getStudentSession()
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load study materials.')
  }

  return (data || []).map((row) => ({
    id: row.id,
    classId: row.class_id || '',
    materialName: row.material_name || '',
    materialLink: row.material_link || '',
    createdAt: row.created_at || null,
  }))
}

export async function fetchAllStudentNotices() {
  const { data, error } = await supabase
    .from(NOTICES_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load notices.')
  }

  return (data || []).map(normalizePortalNotice).filter(Boolean)
}

export async function fetchStudentEvents() {
  const { data, error } = await supabase
    .from('event')
    .select('*')
    .order('event_year', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load events.')
  }

  return (data || [])
    .filter((row) => !row.type || String(row.type).trim() === '')
    .map((row) => ({
      id: row.id,
      eventName: row.event_name || '',
      eventYear: row.event_year || '',
      createdAt: row.created_at || null,
    }))
}

export async function fetchEventPhotos(eventId) {
  const { data, error } = await supabase
    .from('gallary')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load event photos.')
  }

  return (data || []).map((row) => ({
    id: row.id,
    eventId: row.event_id || '',
    type: row.type || '',
    link: row.link || '',
    createdAt: row.created_at || null,
  }))
}
