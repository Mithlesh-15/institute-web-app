import { supabase } from './supabase'

const AUTH_STORAGE_KEY = 'rtc_auth_session'
const TEACHER_TABLE = 'teachers'
const TEACHER_ACCESS_CODE = import.meta.env.VITE_TEACHER_ACCESS_CODE

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const safeParse = (value) => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const createToken = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `token_${Math.random().toString(36).slice(2)}`
}

const normalizePhone = (phone) => String(phone || '').trim()

const normalizeText = (value) => String(value || '').trim()

export const isValidPhone = (phone) => /^\d{10}$/.test(String(phone).trim())

export const isValidTeacherAccessCode = (code) =>
  normalizeText(code).toUpperCase() === TEACHER_ACCESS_CODE

const base64UrlEncode = (obj) => {
  const str = JSON.stringify(obj)
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

const getSignature = (headerB64, payloadB64, secret) => {
  const stringToSign = `${headerB64}.${payloadB64}.${secret}`
  let hash = 5381
  for (let i = 0; i < stringToSign.length; i++) {
    hash = (hash * 33) ^ stringToSign.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

const JWT_SECRET = 'rtc_super_secret_key_2026'

export const encodeJWT = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerB64 = base64UrlEncode(header)
  const payloadB64 = base64UrlEncode(payload)
  const signature = getSignature(headerB64, payloadB64, JWT_SECRET)
  return `${headerB64}.${payloadB64}.${signature}`
}

export const decodeJWT = (token) => {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [headerB64, payloadB64, signature] = parts
  const expectedSignature = getSignature(headerB64, payloadB64, JWT_SECRET)

  if (signature !== expectedSignature) {
    console.warn('JWT signature verification failed')
    return null
  }

  try {
    return base64UrlDecode(payloadB64)
  } catch (e) {
    console.error('Error decoding JWT payload', e)
    return null
  }
}

export const getSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const token = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!token) return null

  return decodeJWT(token)
}

export const saveSession = (session) => {
  if (typeof window === 'undefined') {
    return
  }

  const token = encodeJWT(session)
  window.localStorage.setItem(AUTH_STORAGE_KEY, token)
}

export const clearSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const logout = () => {
  clearSession()
}

const normalizeTeacherRow = (row, fallbackPhone = '') => {
  if (!row) {
    return null
  }

  const phone = normalizePhone(row.phone || fallbackPhone)
  const displayName =
    normalizeText(row.display_name || row.displayName || row.full_name || row.fullName) ||
    `Teacher ${phone.slice(-4) || ''}`.trim()

  return {
    id: row.id,
    role: 'teacher',
    phone,
    password: String(row.password || ''),
    displayName,
    fullName:
      normalizeText(row.full_name || row.fullName || row.display_name || row.displayName) ||
      displayName,
    verified: Boolean(row.verified ?? true),
    coachingName: normalizeText(row.coaching_name || row.coachingName),
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null,
  }
}

const createSessionRecord = ({ sessionToken, loginAt }) => ({
  session_token: sessionToken,
  session_started_at: loginAt,
  last_login_at: loginAt,
  session_active: true,
})

const persistTeacherSession = async (teacher, sessionToken, loginAt) => {
  const payload = createSessionRecord({ sessionToken, loginAt })
  const { data, error } = await supabase
    .from(TEACHER_TABLE)
    .update(payload)
    .eq('id', teacher.id)
    .select('*')
    .single()

  if (error) {
    console.warn('Teacher session save failed:', error.message || error)
    return teacher
  }

  return normalizeTeacherRow(data || { ...teacher, ...payload }, teacher.phone)
}

const getTeacherByPhone = async (phone) => {
  const normalizedPhone = normalizePhone(phone)
  const { data, error } = await supabase
    .from(TEACHER_TABLE)
    .select('*')
    .eq('phone', normalizedPhone)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || 'Unable to load teacher account.')
  }

  return normalizeTeacherRow(data, normalizedPhone)
}

const createTeacherSession = (teacher) => {
  const loginAt = new Date().toISOString()
  const session = {
    token: createToken(),
    role: 'teacher',
    teacherId: teacher.id,
    phone: teacher.phone,
    displayName: teacher.displayName || teacher.fullName || 'Teacher',
    fullName: teacher.fullName || teacher.displayName || 'Teacher',
    coachingName: teacher.coachingName || '',
    verified: Boolean(teacher.verified ?? true),
    loginAt,
  }

  saveSession(session)
  return { session, loginAt }
}

export const verifyTeacherAccessCode = async (code) => {
  await delay(500)

  if (!isValidTeacherAccessCode(code)) {
    throw new Error('Invalid Teacher Access Code')
  }

  return true
}

const createTeacherRecord = async ({ phone, password }) => {
  const trimmedPhone = normalizePhone(phone)
  const trimmedPassword = String(password || '')
  const existingTeacher = await getTeacherByPhone(trimmedPhone)

  if (existingTeacher) {
    if (existingTeacher.password !== trimmedPassword) {
      throw new Error('That phone number already exists. Please enter the correct password.')
    }

    return existingTeacher
  }

  const timestamp = new Date().toISOString()
  const baseDisplayName = `Teacher ${trimmedPhone.slice(-4) || ''}`.trim()
  const payload = {
    phone: trimmedPhone,
    password: trimmedPassword,
    full_name: baseDisplayName,
    verified: true,
    role: 'teacher',
    created_at: timestamp,
  }

  const { data, error } = await supabase.from(TEACHER_TABLE).insert(payload).select('*').single()

  if (error) {
    const message = error.message || 'Unable to create teacher account.'

    if (message.toLowerCase().includes('duplicate') || message.toLowerCase().includes('unique')) {
      const teacher = await getTeacherByPhone(trimmedPhone)

      if (teacher?.password === trimmedPassword) {
        return teacher
      }
    }

    throw new Error(message)
  }

  return normalizeTeacherRow(data, trimmedPhone)
}

export const authenticateTeacherLogin = async ({ phone, password }) => {
  await delay(900)

  const trimmedPhone = normalizePhone(phone)
  const trimmedPassword = String(password || '')

  if (!isValidPhone(trimmedPhone)) {
    throw new Error('Please enter a valid 10-digit phone number.')
  }

  if (!trimmedPassword) {
    throw new Error('Please enter your password.')
  }

  const profile = await getTeacherByPhone(trimmedPhone)

  if (profile) {
    if (profile.password !== trimmedPassword) {
      throw new Error('Incorrect password. Please try again.')
    }

    const { session, loginAt } = createTeacherSession(profile)
    await persistTeacherSession(profile, session.token, loginAt)

    return {
      status: 'success',
      session,
      profile,
      redirectTo: '/teacher/dashboard',
    }
  }

  return {
    status: 'access_code_required',
  }
}

export const createTeacherFromAccessCode = async ({ phone, password, accessCode }) => {
  await delay(900)

  if (!isValidTeacherAccessCode(accessCode)) {
    throw new Error('Invalid Teacher Access Code')
  }

  if (!isValidPhone(phone)) {
    throw new Error('Please enter a valid 10-digit phone number.')
  }

  if (!String(password || '').trim()) {
    throw new Error('Please enter your password.')
  }

  const teacher = await createTeacherRecord({ phone, password })
  const { session, loginAt } = createTeacherSession(teacher)
  const persistedTeacher = await persistTeacherSession(teacher, session.token, loginAt)

  return {
    status: 'success',
    teacher: persistedTeacher,
    session,
    redirectTo: '/teacher/dashboard',
  }
}

export const authenticateMockUser = async ({ role, phone, password, rememberSession }) => {
  await delay(900)

  const normalizedRole = role === 'teacher' ? 'teacher' : 'student'
  const trimmedPhone = String(phone).trim()
  const trimmedPassword = String(password)

  if (!isValidPhone(trimmedPhone)) {
    throw new Error('Please enter a valid 10-digit phone number.')
  }

  if (!trimmedPassword) {
    throw new Error('Please enter your password.')
  }

  const session = {
    token: createToken(),
    role: normalizedRole,
    phone: trimmedPhone,
    displayName: normalizedRole === 'teacher' ? 'Teacher' : 'Student',
    rememberSession: Boolean(rememberSession),
    loginAt: new Date().toISOString(),
  }

  saveSession(session)

  return {
    status: 'success',
    session,
    redirectTo: `/${normalizedRole}/dashboard`,
  }
}
