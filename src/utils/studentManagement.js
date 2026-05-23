import { supabase } from './supabase'

const STUDENT_TABLE = 'students'

const normalizeText = (value) => String(value || '').trim()

const normalizeSubjects = (subjects) =>
  Array.isArray(subjects)
    ? [...new Set(subjects.map((subject) => normalizeText(subject)).filter(Boolean))]
    : []

export const STUDENT_CLASS_OPTIONS = ['All', '9th', '10th', '11th', '12th']

export const normalizeStudent = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: normalizeText(row.name),
    phone: normalizeText(row.phone),
    className: normalizeText(row.class || row.className),
    photo: row.photo || '',
    subjects: normalizeSubjects(row.subjects),
    role: row.role || 'student',
    createdAt: row.created_at || row.createdAt || null,
  }
}

export async function fetchStudents() {
  const { data, error } = await supabase
    .from(STUDENT_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

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
