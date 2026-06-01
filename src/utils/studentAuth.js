import { supabase } from "./supabase";
import { getSession, isValidPhone, saveSession } from "./auth";

const STUDENT_TABLE = "students";
const STUDENT_DRAFT_KEY = "rtc_student_setup_draft";
const STUDENT_PHOTO_BUCKET = "student-photos";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeParse = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeText = (value) => String(value || "").trim();

const normalizeSubjects = (subjects) =>
  Array.isArray(subjects)
    ? [
        ...new Set(
          subjects.map((subject) => normalizeText(subject)).filter(Boolean),
        ),
      ]
    : [];

const normalizeStudentRow = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt || null,
    phone: normalizeText(row.phone),
    password: String(row.password || ""),
    photo: row.photo || "",
    className: normalizeText(row.class || row.className),
    subjects: normalizeSubjects(row.subjects),
    name: normalizeText(row.name),
    role: row.role || "student",
    totalFees: row.total_fees ?? 0,
    fatherName: normalizeText(row.father_name),
    schoolName: normalizeText(row.school_name),
    address: normalizeText(row.address),
    board: normalizeText(row.board),
    medium: normalizeText(row.medium),
  };
};

const sanitizeStudentForSession = (student) => {
  if (!student) {
    return null;
  }

  const { password: _password, subjects: _subjects, ...rest } = student;
  return rest;
};

export const getStudentDraft = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return safeParse(window.localStorage.getItem(STUDENT_DRAFT_KEY));
};

export const saveStudentDraft = (draft) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STUDENT_DRAFT_KEY, JSON.stringify(draft));
};

export const clearStudentDraft = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STUDENT_DRAFT_KEY);
};

export const getStudentSession = () => {
  const session = getSession();
  return session?.role === "student" ? session : null;
};

export const createStudentSession = (student) => {
  const safeStudent = sanitizeStudentForSession(student);

  const session = {
    token:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `student_${Date.now()}`,
    role: "student",
    studentId: safeStudent.id,
    phone: safeStudent.phone,
    displayName: safeStudent.name,
    className: safeStudent.className,
    photo: safeStudent.photo || "",
    student: safeStudent,
    loginAt: new Date().toISOString(),
  };

  saveSession(session);
  return session;
};

export const uploadStudentPhoto = async (file) => {
  if (!file) {
    return "";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : String(Date.now());
  const filePath = `students/${fileId}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(STUDENT_PHOTO_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Unable to upload profile photo.");
  }

  const { data } = supabase.storage
    .from(STUDENT_PHOTO_BUCKET)
    .getPublicUrl(filePath);
  return data?.publicUrl || "";
};

const getStudentByPhone = async (phone) => {
  const normalizedPhone = normalizeText(phone);
  const { data, error } = await supabase
    .from(STUDENT_TABLE)
    .select("*")
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Unable to load student account.");
  }

  return normalizeStudentRow(data);
};

export const authenticateStudentLogin = async ({ phone, password }) => {
  await delay(750);

  const trimmedPhone = normalizeText(phone);
  const trimmedPassword = String(password || "");

  if (!isValidPhone(trimmedPhone)) {
    throw new Error("Please enter a valid 10-digit phone number.");
  }

  if (!trimmedPassword) {
    throw new Error("Please enter your password.");
  }

  const student = await getStudentByPhone(trimmedPhone);

  if (!student) {
    return {
      status: "setup_required",
    };
  }

  if (student.password !== trimmedPassword) {
    throw new Error("Incorrect password. Please try again.");
  }

  const session = createStudentSession(student);

  return {
    status: "success",
    student,
    session,
    redirectTo: "/student/dashboard",
  };
};

export const createStudentProfile = async ({
  phone,
  password,
  name,
  className,
  photoFile,
  fatherName = '',
  schoolName = '',
  address = '',
  board = '',
  medium = '',
}) => {
  await delay(900);

  const trimmedPhone = normalizeText(phone);
  const trimmedPassword = String(password || "");
  const trimmedName = normalizeText(name);
  if (!isValidPhone(trimmedPhone)) {
    throw new Error("Please enter a valid 10-digit phone number.");
  }

  if (!trimmedPassword) {
    throw new Error("Please enter your password.");
  }

  if (!trimmedName) {
    throw new Error("Please enter the student name.");
  }

  if (!className) {
    throw new Error("Please select a class.");
  }

  const existing = await getStudentByPhone(trimmedPhone);
  if (existing) {
    if (existing.password !== trimmedPassword) {
      throw new Error(
        "This phone number already exists. Please use the correct password.",
      );
    }

    const session = createStudentSession(existing);
    return {
      status: "success",
      student: existing,
      session,
      redirectTo: "/student/dashboard",
    };
  }

  const photo = photoFile ? await uploadStudentPhoto(photoFile) : "https://xliawmwwielzegkfuhuw.supabase.co/storage/v1/object/public/student-photos/students/8869bed8-d144-43b6-9528-e8b461646542-1779721299128.png";

  const payload = {
    phone: trimmedPhone,
    password: trimmedPassword,
    photo,
    class: className,
    name: trimmedName,
    role: "student",
    total_fees: 0,
    father_name: normalizeText(fatherName),
    school_name: normalizeText(schoolName),
    address: normalizeText(address),
    board: normalizeText(board),
    medium: normalizeText(medium),
  };

  const { data, error } = await supabase
    .from(STUDENT_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Unable to create student profile.");
  }

  const student = normalizeStudentRow(data);
  const session = createStudentSession(student);

  return {
    status: "success",
    student,
    session,
    redirectTo: "/student/dashboard",
  };
};
