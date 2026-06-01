import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BadgeCheck, UserRound, KeyRound, Sparkles, ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ClassSelector from '../../components/student/ClassSelector'
import PhotoUpload from '../../components/student/PhotoUpload'
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

  const [accessCode, setAccessCode] = useState('')
  const [isAccessCodeVerified, setIsAccessCodeVerified] = useState(false)
  const [accessCodeError, setAccessCodeError] = useState('')

  const [form, setForm] = useState({
    phone: draft?.phone || '',
    password: draft?.password || '',
    name: '',
    fatherName: '',
    className: '',
    board: '',
    medium: '',
    schoolName: '',
    address: '',
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

  const handleVerifyAccessCode = (e) => {
    e.preventDefault()
    setAccessCodeError('')
    const systemCode = String(import.meta.env.VITE_STUDENT_ACCESS_CODE).trim().toUpperCase()
    const enteredCode = accessCode.trim().toUpperCase()

    if (!enteredCode) {
      setAccessCodeError('Please enter the Student Access Code.')
      return
    }

    if (enteredCode === systemCode) {
      setIsAccessCodeVerified(true)
    } else {
      setAccessCodeError('Invalid access code. Please verify and try again.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Please enter the student name.')
      return
    }
    if (!form.fatherName.trim()) {
      setError("Please enter the father's name.")
      return
    }
    if (!form.photoFile) {
      setError('Please upload a profile photo.')
      return
    }
    if (!form.className) {
      setError('Please select a class.')
      return
    }
    if (!form.board) {
      setError('Please select a board.')
      return
    }
    if (!form.medium) {
      setError('Please select a medium.')
      return
    }
    if (!form.schoolName.trim()) {
      setError('Please enter your school name.')
      return
    }
    if (!form.address.trim()) {
      setError('Please enter your address.')
      return
    }

    setLoading(true)

    try {
      const result = await createStudentProfile({
        phone: draft?.phone || form.phone,
        password: draft?.password || form.password,
        name: form.name,
        className: form.className,
        photoFile: form.photoFile,
        fatherName: form.fatherName,
        schoolName: form.schoolName,
        address: form.address,
        board: form.board,
        medium: form.medium,
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

  // Phase 1: Access Code verification screen
  if (!isAccessCodeVerified) {
    return (
      <StudentPageShell
        eyebrow="Verification Required"
        title="Student Access Code"
        description="Please enter the Student Access Code provided by your coaching institute to unlock the registration form."
        rightSlot={
          <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              Secure Verification
            </div>
          </div>
        }
      >
        <div className="mx-auto max-w-md mt-8">
          <form
            onSubmit={handleVerifyAccessCode}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8"
          >
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand">
                  <KeyRound className="h-7 w-7" />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">Enter Access Code</h3>
                <p className="text-sm text-slate-500 mt-1">This code verifies that you are an authorized student.</p>
              </div>

              <Input
              type="password"
                id="access-code"
                label="Student Access Code"
                placeholder="e.g. YYY-C-XXXXXX"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value)
                  if (accessCodeError) setAccessCodeError('')
                }}
                error={accessCodeError}
                autoFocus
              />

              <Button type="submit" fullWidth>
                Verify & Continue
              </Button>
            </div>
          </form>
        </div>
      </StudentPageShell>
    )
  }

  // Phase 2: Registration details
  const boards = ['CGBSE', 'CBSE', 'UG', 'PG']
  const mediums = ['Hindi', 'English']

  return (
    <StudentPageShell
      eyebrow="Student onboarding"
      title="Complete your profile"
      description="Tell us a little about you so we can create your student profile and unlock the dashboard."
      rightSlot={
        <div className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 shadow-sm">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-brand" />
            Quick setup
          </div>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          
          {/* Left Column */}
          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Account Credentials</p>
                  <p className="text-xs text-slate-500">Phone and password cannot be changed here.</p>
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
                  error={draft?.phone && !isValidPhone(draft.phone) ? 'Invalid draft phone number.' : ''}
                />

                <Input
                  id="student-setup-password"
                  label="Password"
                  type="password"
                  value={draft?.password || form.password}
                  disabled
                />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Personal Details</p>
                  <p className="text-xs text-slate-500">Enter your name and father's name.</p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  id="student-name"
                  label="Full Name"
                  placeholder="Enter student's full name"
                  value={form.name}
                  onChange={updateField('name')}
                  disabled={loading}
                />

                <Input
                  id="student-father"
                  label="Father's Name"
                  placeholder="Enter father's name"
                  value={form.fatherName}
                  onChange={updateField('fatherName')}
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
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Class Selector */}
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-slate-900">Select Class</p>
              <p className="mt-1 text-xs text-slate-500">
                Choose the student's current class.
              </p>
              <div className="mt-4">
                <ClassSelector value={form.className} onChange={(className) => {
                  setForm((current) => ({ ...current, className }))
                  if (error) setError('')
                }} />
              </div>
            </div>

            {/* Board Selector */}
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-slate-900">Select Board</p>
              <p className="mt-1 text-xs text-slate-500">
                Select your education board.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4 sm:grid-cols-4">
                {boards.map((boardName) => {
                  const selected = form.board === boardName
                  return (
                    <button
                      key={boardName}
                      type="button"
                      onClick={() => {
                        setForm((current) => ({ ...current, board: boardName }))
                        if (error) setError('')
                      }}
                      className={[
                        'rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300',
                        selected
                          ? 'border-brand bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.92))] text-white shadow-[0_16px_30px_rgba(37,99,235,0.18)]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-brand/25 hover:bg-surface',
                      ].join(' ')}
                    >
                      {boardName}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Medium Selector */}
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold text-slate-900">Select Medium</p>
              <p className="mt-1 text-xs text-slate-500">
                Choose Hindi or English medium.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {mediums.map((mediumName) => {
                  const selected = form.medium === mediumName
                  return (
                    <button
                      key={mediumName}
                      type="button"
                      onClick={() => {
                        setForm((current) => ({ ...current, medium: mediumName }))
                        if (error) setError('')
                      }}
                      className={[
                        'rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300',
                        selected
                          ? 'border-brand bg-[linear-gradient(135deg,rgba(37,99,235,0.95),rgba(29,78,216,0.92))] text-white shadow-[0_16px_30px_rgba(37,99,235,0.18)]'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-brand/25 hover:bg-surface',
                      ].join(' ')}
                    >
                      {mediumName}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* School & Address Textareas */}
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] space-y-4">
              <div>
                <label htmlFor="student-school" className="block text-sm font-semibold text-slate-900 mb-1">
                  School Name
                </label>
                <textarea
                  id="student-school"
                  placeholder="Enter school name"
                  value={form.schoolName}
                  onChange={updateField('schoolName')}
                  disabled={loading}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor="student-address" className="block text-sm font-semibold text-slate-900 mb-1">
                  Address
                </label>
                <textarea
                  id="student-address"
                  placeholder="Enter full address"
                  value={form.address}
                  onChange={updateField('address')}
                  disabled={loading}
                  rows={2}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none"
                />
              </div>
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
