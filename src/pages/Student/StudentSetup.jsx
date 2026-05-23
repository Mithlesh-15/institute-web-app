import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BadgeCheck, Sparkles, UserRound } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ClassSelector from '../../components/student/ClassSelector'
import PhotoUpload from '../../components/student/PhotoUpload'
import SubjectPicker from '../../components/student/SubjectPicker'
import StudentPageShell from '../../components/student/StudentPageShell'
import { getSession, isValidPhone } from '../../utils/auth'
import {
  clearStudentDraft,
  createStudentProfile,
  getStudentDraft,
} from '../../utils/studentAuth'

function StudentSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()

  const draft = useMemo(() => {
    return location.state || getStudentDraft()
  }, [location.state])

  const [form, setForm] = useState({
    phone: draft?.phone || '',
    password: draft?.password || '',
    name: '',
    className: '',
    subjects: [],
    photoFile: null,
    photoPreview: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.token && session.role === 'student') {
      navigate('/student/dashboard', { replace: true })
    }

    if (!draft?.phone || !draft?.password) {
      if (!session?.token) {
        navigate('/login/student', { replace: true })
      }
    }
  }, [draft?.password, draft?.phone, navigate, session])

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

  const handleSubjectToggle = (subject) => {
    setForm((current) => {
      const exists = current.subjects.includes(subject)

      return {
        ...current,
        subjects: exists
          ? current.subjects.filter((item) => item !== subject)
          : [...current.subjects, subject],
      }
    })

    if (error) {
      setError('')
    }
  }

  const handlePhotoChange = (photoFile, photoPreview) => {
    setForm((current) => ({
      ...current,
      photoFile,
      photoPreview,
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
      const result = await createStudentProfile({
        phone: draft?.phone || form.phone,
        password: draft?.password || form.password,
        name: form.name,
        className: form.className,
        subjects: form.subjects,
        photoFile: form.photoFile,
      })

      clearStudentDraft()
      navigate(result.redirectTo, { replace: true })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to complete setup right now.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <StudentPageShell
      eyebrow="Student onboarding"
      title="Complete your profile"
      description="Tell us a little about you so we can create your student profile and unlock the dashboard."
      rightSlot={
        <div className="rounded-2xl border border-[#ffd900]/30 bg-white px-4 py-3 text-sm font-medium text-[#7a5a00] shadow-sm">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-[#f25d0d]" />
            Quick setup
          </div>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(242,93,13,0.95),rgba(255,145,0,0.9))] text-white">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Profile details</p>
                  <p className="text-sm text-slate-500">Phone and password come from login.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <Input
                  id="student-setup-phone"
                  label="Phone number"
                  value={draft?.phone || form.phone}
                  onChange={updateField('phone')}
                  autoComplete="tel"
                  inputMode="numeric"
                  disabled
                  hint="Pulled from the login step."
                  error={draft?.phone && !isValidPhone(draft.phone) ? 'Invalid draft phone number.' : ''}
                />

                <Input
                  id="student-name"
                  label="Full name"
                  placeholder="Enter student name"
                  value={form.name}
                  onChange={updateField('name')}
                  disabled={loading}
                />
              </div>
            </div>

            <PhotoUpload
              file={form.photoFile}
              preview={form.photoPreview}
              onChange={handlePhotoChange}
              onClear={() =>
                setForm((current) => ({
                  ...current,
                  photoFile: null,
                  photoPreview: '',
                }))
              }
            />
            <p className="px-1 text-xs font-medium text-slate-500">
              Photo is optional. You can skip it and add one later.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-slate-900">Select class</p>
              <p className="mt-1 text-sm text-slate-500">
                Choose the student&apos;s current class.
              </p>
              <div className="mt-4">
                <ClassSelector value={form.className} onChange={(className) => {
                  setForm((current) => ({ ...current, className }))
                  if (error) setError('')
                }} />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-slate-900">Subjects studying</p>
              <p className="mt-1 text-sm text-slate-500">
                Select one or more subjects.
              </p>
              <div className="mt-4">
                <SubjectPicker value={form.subjects} onToggle={handleSubjectToggle} />
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(242,93,13,0.08),rgba(255,145,0,0.05),rgba(255,217,0,0.04))] p-5">
              <p className="text-sm font-semibold text-slate-900">Ready to create your profile?</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your phone number, password, class, subjects, and optional photo will be saved to Supabase.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button type="submit" loading={loading} fullWidth>
          Create student profile
        </Button>
      </form>
    </StudentPageShell>
  )
}

export default StudentSetup
