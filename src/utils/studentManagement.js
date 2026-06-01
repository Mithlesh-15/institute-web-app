import { supabase } from './supabase'

const STUDENT_TABLE = 'students'

const normalizeText = (value) => String(value || '').trim()

const normalizeSubjects = (subjects) =>
  Array.isArray(subjects)
    ? [...new Set(subjects.map((subject) => normalizeText(subject)).filter(Boolean))]
    : []

export const STUDENT_CLASS_OPTIONS = ['All', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG']

export const normalizeStudent = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: normalizeText(row.name),
    className: normalizeText(row.class || row.className),
    totalFees: Number(row.total_fees || row.totalFees || 0),
    photo: row.photo || '',
    phone: normalizeText(row.phone),
    fatherName: normalizeText(row.father_name || row.fatherName),
    schoolName: normalizeText(row.school_name || row.schoolName),
    address: normalizeText(row.address),
    board: normalizeText(row.board),
    medium: normalizeText(row.medium),
  }
}

export async function fetchStudents() {
  const { data, error } = await supabase
    .from(STUDENT_TABLE)
    .select('*')

  if (error) {
    throw new Error(error.message || 'Unable to fetch students.')
  }

  return (data || []).map(normalizeStudent).filter(Boolean)
}

export async function deleteStudentById(studentId) {
  const { error } = await supabase
    .from(STUDENT_TABLE)
    .delete()
    .eq('id', studentId)

  if (error) {
    throw new Error(error.message || 'Unable to delete student.')
  }
}

export async function fetchStudentById(studentId) {
  const { data, error } = await supabase
    .from(STUDENT_TABLE)
    .select('*')
    .eq('id', studentId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Unable to load student.')
  }

  return normalizeStudent(data)
}

export async function updateStudentById(studentId, updates = {}) {
  const payload = {}

  if (Object.prototype.hasOwnProperty.call(updates, 'name')) {
    payload.name = normalizeText(updates.name).toUpperCase()
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'fatherName')) {
    payload.father_name = normalizeText(updates.fatherName).toUpperCase()
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'className')) {
    payload.class = normalizeText(updates.className)
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'totalFees')) {
    payload.total_fees = Number(updates.totalFees || 0)
  }

  if (!Object.keys(payload).length) {
    return fetchStudentById(studentId)
  }

  const { data, error } = await supabase
    .from(STUDENT_TABLE)
    .update(payload)
    .eq('id', studentId)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Unable to update student.')
  }

  return normalizeStudent(data)
}
