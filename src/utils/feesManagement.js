import { getSession } from './auth'
import { supabase } from './supabase'
import { fetchStudents, normalizeStudent } from './studentManagement'

const FEES_TABLE = 'fees'

const normalizeText = (value) => String(value || '').trim()

export const FEE_STATUS_OPTIONS = ['paid', 'pending']

export const MONTH_NAMES = [
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

export const getTodayDateValue = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getCurrentMonthYear = () => {
  const today = new Date()
  return {
    month: MONTH_NAMES[today.getMonth()],
    monthIndex: today.getMonth() + 1,
    year: today.getFullYear(),
  }
}

export const formatMonthYear = (month, year) => `${month} ${year}`

export const formatDisplayMonthYear = (month, year) => `${month} ${year}`

export const getMonthIndex = (month) => {
  const index = MONTH_NAMES.findIndex(
    (monthName) => monthName.toLowerCase() === normalizeText(month).toLowerCase(),
  )

  return index >= 0 ? index + 1 : 0
}

const getTeacherId = () => {
  const session = getSession()
  return session?.teacherId || ''
}

export const normalizeFeeRecord = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    studentId: row.student_id || row.studentId || '',
    month: normalizeText(row.month),
    year: Number(row.year || 0),
    status: normalizeText(row.status),
    pendingAmount: Number(row.pending_amount || 0),
    paymentDate: row.payment_date || null,
  }
}

export const normalizeStudentFee = (student, fees = [], currentMonthYear) => {
  const studentFees = fees
    .filter((fee) => fee.studentId === student.id)
    .sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year
      }

      return getMonthIndex(b.month) - getMonthIndex(a.month)
    })

  const currentFee = studentFees.find(
    (fee) =>
      fee.month.toLowerCase() === currentMonthYear.month.toLowerCase() &&
      fee.year === currentMonthYear.year,
  )
  const currentPendingAmount =
    currentFee?.status === 'pending'
      ? Number(currentFee.pendingAmount || student.totalFees || 0)
      : 0
  const normalizedCurrentFee = currentFee
    ? {
        ...currentFee,
        pendingAmount: currentPendingAmount,
      }
    : null

  const previousPendingFees = studentFees.filter((fee) => {
    const isCurrentMonth =
      fee.month.toLowerCase() === currentMonthYear.month.toLowerCase() &&
      fee.year === currentMonthYear.year

    return !isCurrentMonth && fee.status === 'pending'
  })

  return {
    ...student,
    currentFee: normalizedCurrentFee,
    previousPendingFees,
    allFees: studentFees,
    previousPendingCount: previousPendingFees.length,
    previousPendingAmount: previousPendingFees.reduce(
      (total, fee) => total + Number(fee.pendingAmount || 0),
      0,
    ),
    totalPendingCount: previousPendingFees.length + (normalizedCurrentFee?.status === 'pending' ? 1 : 0),
    totalPendingAmount:
      previousPendingFees.reduce(
        (total, fee) => total + Number(fee.pendingAmount || 0),
        0,
      ) + Number(normalizedCurrentFee?.status === 'pending' ? normalizedCurrentFee.pendingAmount || 0 : 0),
  }
}

export async function fetchFeesStudents() {
  return fetchStudents()
}

export async function fetchFeesRecords(studentIds = []) {
  if (!studentIds.length) {
    return []
  }

  const { data, error } = await supabase
    .from(FEES_TABLE)
    .select('*')
    .in('student_id', studentIds)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load fees records.')
  }

  return (data || []).map(normalizeFeeRecord).filter(Boolean)
}

export async function ensureCurrentMonthFees(students = []) {
  const session = getSession()

  if (!session) {
    throw new Error('Session not found. Please log in again.')
  }

  const currentMonthYear = getCurrentMonthYear()
  const studentIds = students.map((student) => student.id).filter(Boolean)

  if (!studentIds.length) {
    return { insertedCount: 0 }
  }

  const { data, error } = await supabase
    .from(FEES_TABLE)
    .select('student_id')
    .in('student_id', studentIds)
    .eq('month', currentMonthYear.month)
    .eq('year', String(currentMonthYear.year))

  if (error) {
    throw new Error(error.message || 'Unable to verify current month fees.')
  }

  const existingStudentIds = new Set((data || []).map((row) => row.student_id).filter(Boolean))
  const missingRows = studentIds
    .filter((studentId) => !existingStudentIds.has(studentId))
    .map((studentId) => {
      const student = students.find((item) => item.id === studentId)

      return {
        student_id: studentId,
        month: currentMonthYear.month,
        year: String(currentMonthYear.year),
        status: 'pending',
        pending_amount: Number(student?.totalFees || 0),
      }
    })

  if (!missingRows.length) {
    return { insertedCount: 0 }
  }

  const { error: insertError } = await supabase.from(FEES_TABLE).insert(missingRows)

  if (insertError) {
    throw new Error(insertError.message || 'Unable to create current month fees.')
  }

  return { insertedCount: missingRows.length }
}

export async function fetchFeesOverview() {
  const students = await fetchFeesStudents()
  await ensureCurrentMonthFees(students)
  const currentMonthYear = getCurrentMonthYear()
  const fees = await fetchFeesRecords(students.map((student) => student.id))

  return students.map((student) =>
    normalizeStudentFee(normalizeStudent(student), fees, currentMonthYear),
  )
}

export async function fetchStudentFeeHistory(studentId) {
  const { data, error } = await supabase
    .from(FEES_TABLE)
    .select('*')
    .eq('student_id', studentId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load fee history.')
  }

  return (data || []).map(normalizeFeeRecord).filter(Boolean)
}

export async function saveStudentCurrentMonthFee(studentId, { status, pendingAmount, month, year, paymentDate }) {
  return saveStudentFeeRecord(studentId, {
    status,
    pendingAmount,
    month,
    year,
    paymentDate,
  })
}

export async function saveStudentFeeRecord(
  studentId,
  { status, pendingAmount, month, year, paymentDate },
) {
  const teacherId = getTeacherId()

  if (!teacherId) {
    throw new Error('Teacher session not found. Please log in again.')
  }

  const normalizedStatusRaw = normalizeText(status)
  const normalizedPendingAmount = Number(pendingAmount || 0)
  const normalizedMonth = normalizeText(month)
  const normalizedYear = Number(year)
  const normalizedStatus =
    normalizedPendingAmount <= 0 ? 'paid' : normalizedStatusRaw || 'pending'
  const nextStatus =
    normalizedStatus === 'paid' || normalizedPendingAmount <= 0 ? 'paid' : 'pending'

  const payload = {
    student_id: studentId,
    month: normalizedMonth,
    year: normalizedYear,
    status: nextStatus,
    pending_amount: nextStatus === 'paid' ? 0 : normalizedPendingAmount,
    payment_date: nextStatus === 'paid' ? (paymentDate || getTodayDateValue()) : null,
  }

  const { data, error } = await supabase
    .from(FEES_TABLE)
    .upsert(payload, {
      onConflict: 'student_id,month,year',
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to save fee record.')
  }

  return normalizeFeeRecord(data)
}

export async function markStudentFeePaid(studentId, { month, year, paymentDate }) {
  return saveStudentFeeRecord(studentId, {
    status: 'paid',
    pendingAmount: 0,
    month,
    year,
    paymentDate,
  })
}
