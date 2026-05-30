import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, Phone, UserRound } from 'lucide-react'
import ClassSelector from '../../components/student/ClassSelector'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { fetchStudentProfile, updateStudentProfile } from '../../utils/studentPortal'

function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    name: '',
    className: '',
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
            name: data.name,
            className: data.className,
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

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const updatedProfile = await updateStudentProfile(form)
      setProfile(updatedProfile)
      setForm({
        name: updatedProfile.name,
        className: updatedProfile.className,
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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col items-start gap-5">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-blue-50 text-2xl font-semibold text-[#2563eb]">
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

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Student profile
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900">{profile?.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Class {profile?.className || 'N/A'}</p>
          </div>

          <div className="w-full space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Phone className="h-4 w-4 text-[#2563eb]" />
                Phone Number
              </div>
              <p className="mt-2 text-base font-semibold text-slate-900">{profile?.phone || 'N/A'}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <UserRound className="h-4 w-4 text-[#2563eb]" />
                Subjects
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile?.subjects?.length ? (
                  profile.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No subjects added.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
            Edit Profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Basic details</h2>
        </div>

        <div className="mt-6 space-y-5">
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

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Class</p>
            <ClassSelector
              value={form.className}
              onChange={(className) => {
                setForm((current) => ({ ...current, className }))
                setError('')
                setSuccess('')
              }}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="mt-6">
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

export default StudentProfile
