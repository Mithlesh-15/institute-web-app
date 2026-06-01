import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Phone, UserRound, Sparkles } from 'lucide-react'
import ClassSelector from '../../components/student/ClassSelector'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { fetchStudentProfile, updateStudentProfile } from '../../utils/studentPortal'

function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    name: '',
    className: '',
    fatherName: '',
    schoolName: '',
    address: '',
    board: '',
    medium: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStudentProfile()

        if (mounted) {
          setProfile(data)
          setForm({
            name: data.name || '',
            className: data.className || '',
            fatherName: data.fatherName || '',
            schoolName: data.schoolName || '',
            address: data.address || '',
            board: data.board || '',
            medium: data.medium || '',
          })
        }
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load profile right now.',
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  const initials = useMemo(() => {
    return (profile?.name || 'Student')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }, [profile?.name])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('Please enter the student name.')
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

    try {
      setSaving(true)
      const updatedProfile = await updateStudentProfile(form)
      setProfile(updatedProfile)
      setForm({
        name: updatedProfile.name || '',
        className: updatedProfile.className || '',
        fatherName: updatedProfile.fatherName || '',
        schoolName: updatedProfile.schoolName || '',
        address: updatedProfile.address || '',
        board: updatedProfile.board || '',
        medium: updatedProfile.medium || '',
      })
      setSuccess('Profile updated successfully.')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to update profile right now.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft" />
  }

  const boards = ['CGBSE', 'CBSE', 'UP', 'PG']
  const mediums = ['Hindi', 'English']

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      
      {/* Left Column: View Profile Card (Read Only Details) */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft h-fit">
        <div className="flex flex-col items-start gap-5">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-blue-50 text-2xl font-semibold text-brand">
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={profile?.name || 'Student'}
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="w-full">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Student Profile
            </div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 wrap-break-word">{profile?.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Class: {profile?.className || 'N/A'}</p>
          </div>

          <div className="w-full space-y-4 pt-2 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Phone className="h-4 w-4 text-brand" />
                Phone Number (Read-Only)
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile?.phone || 'N/A'}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <UserRound className="h-4 w-4 text-brand" />
                Father's Name
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile?.fatherName || 'N/A'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Edit Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft space-y-6"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Manage Profile
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Edit Details</h2>
          <p className="text-sm text-slate-500 mt-1">Keep your profile details updated.</p>
        </div>

        <div className="space-y-5">
          <Input
            id="student-profile-name"
            label="Name"
            value={form.name}
            onChange={(event) => {
              setForm((current) => ({ ...current, name: event.target.value }))
              setError('')
              setSuccess('')
            }}
            disabled={saving}
          />

          <Input
            id="student-profile-father"
            label="Father's Name"
            value={form.fatherName}
            onChange={(event) => {
              setForm((current) => ({ ...current, fatherName: event.target.value }))
              setError('')
              setSuccess('')
            }}
            disabled={saving}
          />

          {/* Class Selector */}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Class</p>
            <ClassSelector
              value={form.className}
              onChange={(className) => {
                setForm((current) => ({ ...current, className }))
                setError('')
                setSuccess('')
              }}
            />
          </div>

          {/* Board Selector */}
          <div>
            <p className="text-sm font-semibold text-slate-900">Board</p>
            <div className="grid grid-cols-2 gap-3 mt-2 sm:grid-cols-4">
              {boards.map((boardName) => {
                const selected = form.board === boardName
                return (
                  <button
                    key={boardName}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, board: boardName }))
                      setError('')
                      setSuccess('')
                    }}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200',
                      selected
                        ? 'border-brand bg-brand text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand/20 hover:bg-surface',
                    ].join(' ')}
                  >
                    {boardName}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Medium Selector */}
          <div>
            <p className="text-sm font-semibold text-slate-900">Medium</p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {mediums.map((mediumName) => {
                const selected = form.medium === mediumName
                return (
                  <button
                    key={mediumName}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, medium: mediumName }))
                      setError('')
                      setSuccess('')
                    }}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200',
                      selected
                        ? 'border-brand bg-brand text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand/20 hover:bg-surface',
                    ].join(' ')}
                  >
                    {mediumName}
                  </button>
                )
              })}
            </div>
          </div>

          {/* School Name Textarea */}
          <div>
            <label htmlFor="student-profile-school" className="block text-sm font-semibold text-slate-900 mb-1">
              School Name
            </label>
            <textarea
              id="student-profile-school"
              placeholder="Enter school name"
              value={form.schoolName}
              onChange={(e) => {
                setForm((current) => ({ ...current, schoolName: e.target.value }))
                setError('')
                setSuccess('')
              }}
              disabled={saving}
              rows={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none"
            />
          </div>

          {/* Address Textarea */}
          <div>
            <label htmlFor="student-profile-address" className="block text-sm font-semibold text-slate-900 mb-1">
              Address
            </label>
            <textarea
              id="student-profile-address"
              placeholder="Enter full address"
              value={form.address}
              onChange={(e) => {
                setForm((current) => ({ ...current, address: e.target.value }))
                setError('')
                setSuccess('')
              }}
              disabled={saving}
              rows={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="pt-2">
          <Button type="submit" loading={saving} fullWidth>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StudentProfile
