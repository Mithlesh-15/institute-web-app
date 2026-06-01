import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'
import TeacherAccessCodeModal from '../../components/teacher/TeacherAccessCodeModal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  authenticateTeacherLogin,
  createTeacherFromAccessCode,
  getSession,
  isValidPhone,
} from '../../utils/auth'

function TeacherLogin() {
  const navigate = useNavigate()
  const session = getSession()
  const [form, setForm] = useState({
    phone: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [accessCodeLoading, setAccessCodeLoading] = useState(false)
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false)

  useEffect(() => {
    if (session?.token && session.role !== 'teacher') {
      navigate(`/${session.role}/dashboard`, { replace: true })
    }

    if (session?.role === 'teacher' && session.verified) {
      navigate('/teacher/dashboard', { replace: true })
    }
  }, [navigate, session])

  if (session?.token && session.role !== 'teacher') {
    return <Navigate to={`/${session.role}/dashboard`} replace />
  }

  if (session?.role === 'teacher' && session.verified) {
    return <Navigate to="/teacher/dashboard" replace />
  }

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))

    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authenticateTeacherLogin({
        phone: form.phone,
        password: form.password,
      })

      if (result.status === 'access_code_required') {
        setShowAccessCodeModal(true)
        setAccessCode('')
        setCodeError('')
        return
      }

      navigate(result.redirectTo, { replace: true })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to login right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAccessCodeSubmit = async (event) => {
    event.preventDefault()
    setCodeError('')
    setAccessCodeLoading(true)

    try {
      const result = await createTeacherFromAccessCode({
        phone: form.phone,
        password: form.password,
        accessCode,
      })
      setShowAccessCodeModal(false)
      navigate(result.redirectTo, { replace: true })
    } catch (submitError) {
      setCodeError(
        submitError instanceof Error
          ? submitError.message
          : 'Invalid Teacher Access Code',
      )
    } finally {
      setAccessCodeLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="absolute inset-0 opacity-90">
        <div className="absolute left-[-8%] top-[-10%] h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[8%] h-96 w-96 rounded-full bg-nav/8 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[10%] h-80 w-80 rounded-full bg-brand-soft/35 blur-3xl" />
      </div>

      <main className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-xl">
          <div className="rounded-4xl border border-white/80 bg-white/95 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1 shadow-[0_18px_34px_rgba(37,99,235,0.24)]">
                  <BrandLogo className="h-full w-full object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                    Teacher portal
                  </p>
                  <p className="text-sm text-slate-500">Private access only</p>
                </div>
              </div>

              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Secure staff login
              </div>
            </div>

            <div className="mt-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Teacher sign in
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back, teacher.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                Use your registered phone number and password to access the staff dashboard.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <Input
                id="teacher-phone"
                label="Phone number"
                placeholder="Enter your 10-digit phone number"
                value={form.phone}
                onChange={handleChange('phone')}
                autoComplete="tel"
                inputMode="numeric"
                disabled={loading || accessCodeLoading}
                error={error && !isValidPhone(form.phone) ? error : ''}
                hint="Use the mobile number linked to your staff profile."
              />

              <Input
                id="teacher-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="current-password"
                disabled={loading || accessCodeLoading}
                error={error && isValidPhone(form.phone) ? error : ''}
                rightSlot={
                  <button
                    type="button"
                    className="text-sm font-medium text-brand transition hover:text-brand-strong"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                }
                hint="Existing teachers sign in directly. New teachers are verified securely."
              />

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button type="submit" loading={loading} fullWidth>
                Sign in
              </Button>
            </form>
          </div>
        </section>
      </main>

      <TeacherAccessCodeModal
        open={showAccessCodeModal}
        code={accessCode}
        error={codeError}
        loading={accessCodeLoading}
        onCodeChange={(event) => setAccessCode(event.target.value)}
        onClose={() => {
          setShowAccessCodeModal(false)
          setCodeError('')
        }}
        onSubmit={handleAccessCodeSubmit}
      />
    </div>
  )
}

export default TeacherLogin
