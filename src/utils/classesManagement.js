import { getSession } from "./auth";
import { supabase } from "./supabase";
import { fetchStudents, normalizeStudent } from './studentManagement'

const CLASSES_TABLE = "classes";
const BATCH_STUDENTS_TABLE = 'batch_students'

export const CLASS_OPTIONS = ["All", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "UG", "PG"];

const normalizeText = (value) => String(value || "").trim();

const normalizeDateValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string" && value.length >= 10) {
    return value.slice(0, 10);
  }

  return new Date(value).toISOString().slice(0, 10);
};

const getTeacherId = () => {
  const session = getSession();
  return session?.teacherId || "";
};

export const normalizeClass = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    teacherId: row.teacher_id || row.teacherId || "",
    className: normalizeText(row.class_name || row.className),
    classLevel: normalizeText(row.class || row.classLevel),
    startDate: normalizeDateValue(row.start_date || row.startDate),
    createdAt: row.created_at || row.createdAt || null,
  };
};

export const normalizeBatchStudent = (row) => {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    classId: row.class_id || row.classId || '',
    studentId: row.student_id || row.studentId || '',
    createdAt: row.created_at || row.createdAt || null,
  }
}

const buildPayload = ({ className, classLevel, startDate }) => ({
  class_name: normalizeText(className),
  class: normalizeText(classLevel),
  start_date: normalizeDateValue(startDate),
});

export async function fetchClasses() {
  const teacherId = getTeacherId();

  if (!teacherId) {
    throw new Error("Teacher session not found. Please log in again.");
  }

  const { data, error } = await supabase
    .from(CLASSES_TABLE)
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Unable to fetch classes.");
  }

  return (data || []).map(normalizeClass).filter(Boolean);
}

export async function fetchClassesWithStudentCounts() {
  const [classes, assignmentsResult] = await Promise.all([
    fetchClasses(),
    supabase.from(BATCH_STUDENTS_TABLE).select('class_id'),
  ])

  const { data: assignments, error } = assignmentsResult

  if (error) {
    throw new Error(error.message || 'Unable to fetch class student counts.')
  }

  const countMap = (assignments || []).reduce((accumulator, assignment) => {
    const classId = assignment.class_id

    if (!classId) {
      return accumulator
    }

    accumulator[classId] = (accumulator[classId] || 0) + 1
    return accumulator
  }, {})

  return classes.map((classItem) => ({
    ...classItem,
    totalStudents: countMap[classItem.id] || 0,
  }))
}

export async function fetchClassById(classId) {
  const teacherId = getTeacherId()

  if (!teacherId) {
    throw new Error('Teacher session not found. Please log in again.')
  }

  const { data, error } = await supabase
    .from(CLASSES_TABLE)
    .select('*')
    .eq('id', classId)
    .eq('teacher_id', teacherId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Unable to load class details.')
  }

  return normalizeClass(data)
}

export async function fetchAssignedStudentIds(classId) {
  const { data, error } = await supabase
    .from(BATCH_STUDENTS_TABLE)
    .select('id, student_id')
    .eq('class_id', classId)

  if (error) {
    throw new Error(error.message || 'Unable to load assigned students.')
  }

  return (data || []).map(normalizeBatchStudent).filter(Boolean)
}

export async function fetchClassStudents(classId) {
  const assignments = await fetchAssignedStudentIds(classId)
  const studentIds = assignments.map((assignment) => assignment.studentId).filter(Boolean)

  if (!studentIds.length) {
    return []
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .in('id', studentIds)

  if (error) {
    throw new Error(error.message || 'Unable to load class students.')
  }

  const students = (data || []).map(normalizeStudent).filter(Boolean)
  const studentMap = new Map(students.map((student) => [student.id, student]))

  return studentIds
    .map((studentId) => studentMap.get(studentId))
    .filter(Boolean)
}

export async function fetchAvailableStudentsForClass(classId) {
  const [allStudents, assignedAssignments] = await Promise.all([
    fetchStudents(),
    fetchAssignedStudentIds(classId),
  ])

  const assignedStudentIds = new Set(
    assignedAssignments.map((assignment) => assignment.studentId).filter(Boolean),
  )

  return allStudents.filter((student) => !assignedStudentIds.has(student.id))
}

export async function createClassRecord({ className, classLevel, startDate }) {
  const teacherId = getTeacherId();

  if (!teacherId) {
    throw new Error("Teacher session not found. Please log in again.");
  }

  const payload = {
    teacher_id: teacherId,
    ...buildPayload({ className, classLevel, startDate }),
  };

  const { data, error } = await supabase
    .from(CLASSES_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to create class.");
  }

  return normalizeClass(data);
}

export async function updateClassRecord(
  classId,
  { className, classLevel, startDate },
) {
  const teacherId = getTeacherId();

  if (!teacherId) {
    throw new Error("Teacher session not found. Please log in again.");
  }

  const payload = {
    teacher_id: teacherId,
    ...buildPayload({ className, classLevel, startDate }),
  };

  const { data, error } = await supabase
    .from(CLASSES_TABLE)
    .update(payload)
    .eq("id", classId)
    .eq("teacher_id", teacherId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to update class.");
  }

  return normalizeClass(data);
}

export async function deleteClassRecord(classId) {
  const teacherId = getTeacherId();

  if (!teacherId) {
    throw new Error("Teacher session not found. Please log in again.");
  }

  const { error } = await supabase
    .from(CLASSES_TABLE)
    .delete()
    .eq("id", classId)
    .eq("teacher_id", teacherId);
  if (error) {
    throw new Error(error.message || "Unable to delete class.");
  }
}

export async function addStudentsToClass(classId, studentIds) {
  const teacherId = getTeacherId()

  if (!teacherId) {
    throw new Error('Teacher session not found. Please log in again.')
  }

  const uniqueStudentIds = [...new Set((studentIds || []).filter(Boolean))]

  if (!uniqueStudentIds.length) {
    return { insertedCount: 0 }
  }

  const classRecord = await fetchClassById(classId)

  if (!classRecord) {
    throw new Error('Class not found or you do not have access to it.')
  }

  const existingAssignments = await fetchAssignedStudentIds(classId)
  const assignedStudentIds = new Set(
    existingAssignments.map((assignment) => assignment.studentId).filter(Boolean),
  )

  const rowsToInsert = uniqueStudentIds
    .filter((studentId) => !assignedStudentIds.has(studentId))
    .map((studentId) => ({
      class_id: classId,
      student_id: studentId,
    }))

  if (!rowsToInsert.length) {
    return { insertedCount: 0 }
  }

  const { error } = await supabase.from(BATCH_STUDENTS_TABLE).insert(rowsToInsert)

  if (error) {
    throw new Error(error.message || 'Unable to add students to class.')
  }

  return { insertedCount: rowsToInsert.length }
}

export async function removeStudentFromClass(classId, studentId) {
  const teacherId = getTeacherId()

  if (!teacherId) {
    throw new Error('Teacher session not found. Please log in again.')
  }

  const classRecord = await fetchClassById(classId)

  if (!classRecord) {
    throw new Error('Class not found or you do not have access to it.')
  }

  const { error } = await supabase
    .from(BATCH_STUDENTS_TABLE)
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId)

  if (error) {
    throw new Error(error.message || 'Unable to remove student from class.')
  }
}
