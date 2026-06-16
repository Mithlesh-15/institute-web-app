import { supabase } from './supabase'
import { getSession } from './auth'
import { fetchClasses } from './classesManagement'
import { fetchStudentById, updateStudentById, deleteStudentById, normalizeStudent } from './studentManagement'

const STUDENTS_TABLE = 'students'
const BATCH_STUDENTS_TABLE = 'batch_students'
const ATTENDANCE_TABLE = 'attendance'
const TESTS_TABLE = 'tests'
const TEST_RESULTS_TABLE = 'test_results'
const MATERIALS_TABLE = 'materials'
const NOTICES_TABLE = 'notices'

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

const getTeacherId = () => {
  const session = getSession()
  return session?.teacherId || ''
}

const requireTeacherId = () => {
  const teacherId = getTeacherId()

  if (!teacherId) {
    throw new Error('Teacher session not found. Please log in again.')
  }

  return teacherId
}

const normalizeClass = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    teacherId: row.teacher_id || row.teacherId || '',
    className: normalizeText(row.class_name || row.className),
    classLevel: normalizeText(row.class || row.classLevel),
    startDate: normalizeDateValue(row.start_date || row.startDate),
    createdAt: row.created_at || row.createdAt || null,
  }
}

const normalizeAttendance = (row) => {
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

const normalizeTest = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    teacherId: row.teacher_id || row.teacherId || '',
    classId: row.class_id || row.classId || '',
    className: normalizeText(row.class_name || row.className),
    subject: normalizeText(row.subject),
    testName: normalizeText(row.test_name || row.testName),
    testDate: normalizeDateValue(row.test_date || row.testDate),
    totalMarks: Number(row.total_marks || row.totalMarks || 0),
  }
}

const normalizeTestResult = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    testId: row.test_id || row.testId || '',
    studentId: row.student_id || row.studentId || '',
    marks:
      row.marks === null || row.marks === undefined || row.marks === ''
        ? null
        : Number(row.marks),
    absent: Boolean(row.is_absent ?? row.absent ?? false),
  }
}

const normalizeMaterial = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    teacherId: row.teacher_id || row.teacherId || '',
    classId: row.class_id || row.classId || '',
    materialName: normalizeText(row.material_name || row.materialName),
    materialLink: normalizeText(row.material_link || row.materialLink),
  }
}

const normalizeNotice = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    teacherId: row.teacher_id || row.teacherId || '',
    title: normalizeText(row.title),
    noticeLink: normalizeText(row.link),
  }
}

const fetchTeacherClasses = async () => {
  const classes = await fetchClasses()
  return classes.map(normalizeClass).filter(Boolean)
}

const fetchTeacherClassesByIds = async (classIds = []) => {
  const uniqueClassIds = [...new Set(classIds.filter(Boolean))]

  if (!uniqueClassIds.length) {
    return []
  }

  const classes = await fetchTeacherClasses()
  return classes.filter((classItem) => uniqueClassIds.includes(classItem.id))
}

export async function fetchStudentDetail(studentId) {
  const student = await fetchStudentById(studentId)

  if (!student) {
    throw new Error('Student not found.')
  }

  const { data: assignmentRows, error: assignmentError } = await supabase
    .from(BATCH_STUDENTS_TABLE)
    .select('class_id')
    .eq('student_id', studentId)

  if (assignmentError) {
    throw new Error(assignmentError.message || 'Unable to load student classes.')
  }

  const classIds = (assignmentRows || []).map((row) => row.class_id).filter(Boolean)
  const classes = await fetchTeacherClassesByIds(classIds)

  const attendanceQuery = supabase
    .from(ATTENDANCE_TABLE)
    .select('*')
    .eq('student_id', studentId)

  if (classIds.length) {
    attendanceQuery.in('class_id', classIds)
  }

  const { data: attendanceRows, error: attendanceError } = await attendanceQuery

  if (attendanceError) {
    throw new Error(attendanceError.message || 'Unable to load student attendance.')
  }

  const attendance = (attendanceRows || []).map(normalizeAttendance).filter(Boolean)
  const admissionDateStr = student.createdAt ? (typeof student.createdAt === 'string' ? student.createdAt.slice(0, 10) : new Date(student.createdAt).toISOString().slice(0, 10)) : ''
  
  const eligibleAttendance = admissionDateStr
    ? attendance.filter((record) => record.attendanceDate >= admissionDateStr)
    : attendance

  const attendanceByClass = eligibleAttendance.reduce((accumulator, record) => {
    if (!accumulator[record.classId]) {
      accumulator[record.classId] = []
    }

    accumulator[record.classId].push(record)
    return accumulator
  }, {})

  const classSummaries = classes.map((classItem) => {
    const records = attendanceByClass[classItem.id] || []
    const totalPresent = records.filter((record) => record.status === 'present').length
    const totalAbsent = records.filter((record) => record.status === 'absent').length
    const totalCount = totalPresent + totalAbsent

    return {
      ...classItem,
      totalPresent,
      totalAbsent,
      attendancePercentage: totalCount ? Math.round((totalPresent / totalCount) * 100) : 0,
      totalCount,
    }
  })

  const totalPresent = eligibleAttendance.filter((record) => record.status === 'present').length
  const totalAbsent = eligibleAttendance.filter((record) => record.status === 'absent').length
  const totalCount = totalPresent + totalAbsent

  return {
    student: normalizeStudent({
      ...student,
      total_fees: student.totalFees,
    }),
    classes: classSummaries,
    attendance: {
      totalPresent,
      totalAbsent,
      attendancePercentage: totalCount ? Math.round((totalPresent / totalCount) * 100) : 0,
      totalCount,
      rawList: eligibleAttendance,
    },
  }
}

export async function updateStudentProfile(studentId, updates) {
  return updateStudentById(studentId, updates)
}

export async function updateStudentFees(studentId, totalFees) {
  return updateStudentById(studentId, { totalFees })
}

export { deleteStudentById }

export async function fetchTeacherClassesForDropdown() {
  return fetchTeacherClasses()
}

export async function fetchTeacherTests() {
  const teacherId = requireTeacherId()
  const { data, error } = await supabase
    .from(TESTS_TABLE)
    .select('*')
    .order('test_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load tests.')
  }

  return (data || []).map(normalizeTest).filter(Boolean)
}

export async function fetchTeacherTest(testId) {
  const teacherId = requireTeacherId()
  const { data, error } = await supabase
    .from(TESTS_TABLE)
    .select('*')
    .eq('id', testId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Unable to load test.')
  }

  return normalizeTest(data)
}

export async function createTeacherTest({
  testName,
  classId,
  className,
  subject,
  testDate,
  totalMarks,
}) {
  const teacherId = requireTeacherId()

  const payload = {
    teacher_id: teacherId,
    class_id: classId,
    class_name: normalizeText(className),
    subject: normalizeText(subject),
    test_name: normalizeText(testName),
    test_date: normalizeDateValue(testDate),
    total_marks: Number(totalMarks || 0),
  }

  const { data, error } = await supabase
    .from(TESTS_TABLE)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to create test.')
  }

  return normalizeTest(data)
}

export async function deleteTeacherTest(testId) {
  const teacherId = requireTeacherId()
console.log('1 . Attempting to delete test with testId:', testId, 'for teacherId:', teacherId)
  // Delete associated results first
  const { error: resultsError } = await supabase
    .from(TEST_RESULTS_TABLE)
    .delete()
    .eq('test_id', testId)
console.log('2 . Deleted test results for testId:', testId, 'Error:', resultsError)
  if (resultsError) {
    throw new Error(resultsError.message || 'Unable to delete test results.')
  }

  // Delete the test itself
  const { error } = await supabase
    .from(TESTS_TABLE)
    .delete()
    .eq('id', testId)

  if (error) {
    throw new Error(error.message || 'Unable to delete test.')
  }
}

export async function fetchTestStudents(testId) {
  const test = await fetchTeacherTest(testId)

  if (!test) {
    throw new Error('Test not found.')
  }

  const { data: assignmentRows, error: assignmentError } = await supabase
    .from(BATCH_STUDENTS_TABLE)
    .select('student_id')
    .eq('class_id', test.classId)

  if (assignmentError) {
    throw new Error(assignmentError.message || 'Unable to load test students.')
  }

  const studentIds = (assignmentRows || []).map((row) => row.student_id).filter(Boolean)

  if (!studentIds.length) {
    return []
  }

  const { data: studentRows, error: studentError } = await supabase
    .from(STUDENTS_TABLE)
    .select('*')
    .in('id', studentIds)

  if (studentError) {
    throw new Error(studentError.message || 'Unable to load student list.')
  }

  const students = (studentRows || []).map(normalizeStudent).filter(Boolean)
  const studentMap = new Map(students.map((student) => [student.id, student]))

  return studentIds.map((studentId) => studentMap.get(studentId)).filter(Boolean)
}

export async function fetchTestResultRows(testId) {
  const { data, error } = await supabase
    .from(TEST_RESULTS_TABLE)
    .select('*')
    .eq('test_id', testId)

  if (error) {
    throw new Error(error.message || 'Unable to load test results.')
  }

  return (data || []).map(normalizeTestResult).filter(Boolean)
}

export async function fetchTestDetails(testId) {
  const [test, students, results] = await Promise.all([
    fetchTeacherTest(testId),
    fetchTestStudents(testId),
    fetchTestResultRows(testId),
  ])

  const resultMap = new Map(results.map((result) => [result.studentId, result]))

  return {
    test,
    students: students.map((student) => ({
      ...student,
      result: resultMap.get(student.id) || null,
    })),
    results,
  }
}

export async function saveTestResults(testId, rows = []) {
  const uniqueRows = rows
    .map((row) => ({
      test_id: testId,
      student_id: row.studentId,
      marks:
        row.absent || row.marks === '' || row.marks === null || row.marks === undefined
          ? null
          : Number(row.marks),
      is_absent: Boolean(row.absent),
    }))
    .filter((row) => row.student_id)

  if (!uniqueRows.length) {
    return { savedCount: 0 }
  }

  const { error } = await supabase.from(TEST_RESULTS_TABLE).upsert(uniqueRows, {
    onConflict: 'test_id,student_id',
  })

  if (error) {
    throw new Error(error.message || 'Unable to save test results.')
  }

  return { savedCount: uniqueRows.length }
}

export async function fetchTeacherMaterials() {
  const teacherId = requireTeacherId()
  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load study materials.')
  }

  return (data || []).map(normalizeMaterial).filter(Boolean)
}

export async function createTeacherMaterial({ materialName, classId, materialLink }) {
  const teacherId = requireTeacherId()
  const payload = {
    teacher_id: teacherId,
    class_id: classId,
    material_name: normalizeText(materialName),
    material_link: normalizeText(materialLink),
  }

  const { data, error } = await supabase
    .from(MATERIALS_TABLE)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to add material.')
  }

  return normalizeMaterial(data)
}

export async function deleteTeacherMaterial(materialId) {
  const teacherId = requireTeacherId()
  const { error } = await supabase
    .from(MATERIALS_TABLE)
    .delete()
    .eq('id', materialId)

  if (error) {
    throw new Error(error.message || 'Unable to delete material.')
  }
}

export async function fetchTeacherNotices() {
  const teacherId = requireTeacherId()
  const { data, error } = await supabase
    .from(NOTICES_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message || 'Unable to load notices.')
  }

  return (data || []).map(normalizeNotice).filter(Boolean)
}

export async function createTeacherNotice({ title, noticeLink }) {
  const teacherId = requireTeacherId()
  const payload = {
    teacher_id: teacherId,
    title: normalizeText(title),
    link: normalizeText(noticeLink),
  }

  const { data, error } = await supabase
    .from(NOTICES_TABLE)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to create notice.')
  }

  return normalizeNotice(data)
}

export async function updateTeacherNotice(noticeId, { title, noticeLink }) {
  const teacherId = requireTeacherId()
  const payload = {
    title: normalizeText(title),
    link: normalizeText(noticeLink),
  }

  const { data, error } = await supabase
    .from(NOTICES_TABLE)
    .update(payload)
    .eq('id', noticeId)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to update notice.')
  }

  return normalizeNotice(data)
}

export async function deleteTeacherNotice(noticeId) {
  const teacherId = requireTeacherId()
  const { error } = await supabase
    .from(NOTICES_TABLE)
    .delete()
    .eq('id', noticeId)

  if (error) {
    throw new Error(error.message || 'Unable to delete notice.')
  }
}
