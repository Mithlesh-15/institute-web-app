import { getSession } from "./auth";
import { supabase } from "./supabase";

const CLASSES_TABLE = "classes";

export const CLASS_OPTIONS = ["All", "9th", "10th", "11th", "12th"];

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
