import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StudentPageShell from '../../components/student/StudentPageShell'
import { getSession, isValidPhone } from '../../utils/auth'
import { authenticateStudentLogin, saveStudentDraft } from '../../utils/studentAuth'

function StudentLogin() {
  const navigate = useNavigate()
  const session = getSession()
  const [form, setForm] = useState({
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (session?.token && session.role === 'student') {
      navigate('/student/dashboard', { replace: true })
    }

    if (session?.token && session.role === 'teacher') {
      navigate('/teacher/dashboard', { replace: true })
    }
  }, [navigate, session])

  if (session?.token && session.role === 'student') {
    return <Navigate to="/student/dashboard" replace />
  }

  const updateField = (field) => (event) => {
    const value = event.target.value

    setForm((current) => ({
      ...current,
      [field]: value,
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
      const result = await authenticateStudentLogin({
        phone: form.phone,
        password: form.password,
      })

      if (result.status === 'setup_required') {
        saveStudentDraft({
          phone: form.phone,
          password: form.password,
          startedAt: new Date().toISOString(),
        })

        navigate('/student/setup', {
          replace: true,
          state: { phone: form.phone, password: form.password },
        })
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

  return (
    <StudentPageShell
      eyebrow="Student login"
      title="Sign in"
      description="Enter your registered phone number and password to continue."
    >
      <div className="mx-auto max-w-md">
        <form
          className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-7"
          onSubmit={handleSubmit}
        >
          <div className="space-y-5">
              <Input
                id="student-phone"
                label="Phone number"
                placeholder="Enter your 10-digit phone number"
                value={form.phone}
                onChange={updateField('phone')}
                autoComplete="tel"
                inputMode="numeric"
                disabled={loading}
                error={error && !isValidPhone(form.phone) ? error : ''}
                hint="Use the phone number registered in your profile."
              />

            <Input
              id="student-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField('password')}
              autoComplete="current-password"
              disabled={loading}
              error={error && isValidPhone(form.phone) ? error : ''}
              rightSlot={
                <button
                  type="button"
                  className="text-sm font-medium text-[#2563eb] transition hover:text-[#1d4ed8]"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <span className="inline-flex items-center gap-1">
                      <EyeOff className="h-4 w-4" />
                      Hide
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Show
                    </span>
                  )}
                </button>
              }
            />

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" loading={loading} fullWidth>
              Sign in
            </Button>

            <p className="text-center text-sm text-slate-500">
              First time signing in? We&apos;ll guide you through a quick setup after login.
            </p>
          </div>
        </form>
      </div>
    </StudentPageShell>
  )
}

export default StudentLogin
