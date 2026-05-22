const AUTH_STORAGE_KEY = 'rtc_auth_session'
const NEW_USER_DRAFT_KEY = 'rtc_new_user_draft'

const MOCK_USERS = {
  student: {
    role: 'student',
    phone: '8888888888',
    password: 'student123',
    displayName: 'Student',
  },
  teacher: {
    role: 'teacher',
    phone: '9999999999',
    password: 'teacher123',
    displayName: 'Teacher',
  },
}

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

export const isValidPhone = (phone) => /^\d{10}$/.test(String(phone).trim())

export const getSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return safeParse(window.localStorage.getItem(AUTH_STORAGE_KEY))
}

export const saveSession = (session) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export const clearSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const clearNewUserDraft = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(NEW_USER_DRAFT_KEY)
}

export const getNewUserDraft = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return safeParse(window.localStorage.getItem(NEW_USER_DRAFT_KEY))
}

export const logout = () => {
  clearSession()
  clearNewUserDraft()
}

export const queueNewUserProfileDraft = ({ role, phone }) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    NEW_USER_DRAFT_KEY,
    JSON.stringify({
      role,
      phone,
      createdAt: new Date().toISOString(),
      status: 'pending_profile_creation',
    }),
  )
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

  const expectedUser = MOCK_USERS[normalizedRole]
  const phoneMatchesOtherRole =
    normalizedRole === 'student'
      ? trimmedPhone === MOCK_USERS.teacher.phone
      : trimmedPhone === MOCK_USERS.student.phone

  if (phoneMatchesOtherRole) {
    throw new Error('That phone number belongs to the other portal.')
  }

  if (trimmedPhone === expectedUser.phone && trimmedPassword !== expectedUser.password) {
    throw new Error('Incorrect password. Please try the demo credentials again.')
  }

  if (trimmedPhone === expectedUser.phone && trimmedPassword === expectedUser.password) {
    const session = {
      token: createToken(),
      role: normalizedRole,
      phone: trimmedPhone,
      displayName: expectedUser.displayName,
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

  queueNewUserProfileDraft({
    role: normalizedRole,
    phone: trimmedPhone,
  })

  return {
    status: 'new_user',
    message: 'Profile creation flow will be added here for new users.',
  }
}
