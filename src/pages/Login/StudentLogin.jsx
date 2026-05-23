import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react'
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
      eyebrow="Student access"
      title="Welcome back"
      description="Sign in with your phone number and password to continue to your dashboard."
      rightSlot={
        <div className="hidden rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 shadow-sm md:block">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2563eb]" />
            Secure student login
          </div>
        </div>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(29,78,216,0.05),rgba(219,234,254,0.28))] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-3 py-1 text-xs font-semibold text-blue-700">
            <GraduationCap className="h-3.5 w-3.5 text-[#2563eb]" />
            Student portal
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            Your tuition app, ready on every device.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Keep classes, homework, results, and fee updates in one calm, modern experience built for students.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Fast sign in', 'Phone + password'],
              ['Mobile-first', 'Smooth on small screens'],
              ['Premium feel', 'Clean and polished'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

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
              hint="Use the number registered with your tuition profile."
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
              New here? After login we&apos;ll guide you through a quick setup.
            </p>
          </div>
        </form>
      </div>
    </StudentPageShell>
  )
}

export default StudentLogin
