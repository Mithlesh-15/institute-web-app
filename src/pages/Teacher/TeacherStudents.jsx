import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, Plus, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import EmptyState from '../../components/teacher-students/EmptyState'
import FilterTabs from '../../components/teacher-students/FilterTabs'
import SearchBar from '../../components/teacher-students/SearchBar'
import StudentCard from '../../components/teacher-students/StudentCard'
import StudentProfileModal from '../../components/teacher-students/StudentProfileModal'
import { STUDENT_CLASS_OPTIONS, deleteStudentById, fetchStudents, createStudent } from '../../utils/studentManagement'
import { fetchStudentDetail, updateStudentFees, updateStudentProfile } from '../../utils/teacherPortal'
import { uploadStudentPhoto, convertHeicToJpeg } from '../../utils/studentAuth'

const getTodayDateString = () => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function TeacherStudents() {
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [deletingId, setDeletingId] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingFees, setSavingFees] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const { data: students = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['teacherStudents'],
    queryFn: fetchStudents,
    staleTime: 2 * 60 * 60 * 1000,
  })

  const { data: selectedStudentDetail, isLoading: profileLoading, error: profileQueryError } = useQuery({
    queryKey: ['studentDetail', selectedStudentId],
    queryFn: () => fetchStudentDetail(selectedStudentId),
    enabled: !!selectedStudentId,
    staleTime: 2 * 60 * 60 * 1000,
  })
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [convertingPhoto, setConvertingPhoto] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    className: '6th',
    totalFees: '',
    fatherName: '',
    schoolName: '',
    address: '',
    board: '',
    medium: '',
    createdAt: getTodayDateString(),
  })

  const handleOpenAddForm = () => {
    setForm({
      name: '',
      phone: '',
      password: '',
      className: '6th',
      totalFees: '',
      fatherName: '',
      schoolName: '',
      address: '',
      board: '',
      medium: '',
      createdAt: getTodayDateString(),
    })
    setPhotoFile(null)
    setShowPassword(false)
    setIsAdding(true)
    setError('')
  }

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) return setError('Name is required.')
    if (!form.fatherName.trim()) return setError('Father\'s name is required.')
    if (!form.phone.trim()) return setError('Mobile number is required.')
    if (!form.password.trim()) return setError('Password is required.')
    if (!form.className.trim()) return setError('Class is required.')
    if (!form.schoolName.trim()) return setError('School name is required.')
    if (!form.board.trim()) return setError('Board is required.')
    if (!form.medium.trim()) return setError('Medium is required.')
    if (!form.address.trim()) return setError('Address is required.')
    if (!form.totalFees.trim()) return setError('Monthly fees are required.')

    try {
      setSaving(true)
      setError('')

      // 1. Upload photo to Supabase storage bucket 'student-photos' if provided, otherwise default to empty string
      let photoUrl = "https://xliawmwwielzegkfuhuw.supabase.co/storage/v1/object/public/student-photos/students/rtc%20logo.png"
      if (photoFile) {
        const uploadedUrl = await uploadStudentPhoto(photoFile)
        if (!uploadedUrl) {
          throw new Error('Failed to retrieve photo upload URL.')
        }
        photoUrl = uploadedUrl
      }

      // 2. Create student record
      await createStudent({
        name: form.name,
        fatherName: form.fatherName,
        phone: form.phone,
        password: form.password,
        className: form.className,
        schoolName: form.schoolName,
        board: form.board,
        medium: form.medium,
        address: form.address,
        totalFees: form.totalFees,
        photo: photoUrl,
        createdAt: form.createdAt ? new Date(form.createdAt).toISOString() : new Date().toISOString(),
      })

      setIsAdding(false)
      queryClient.invalidateQueries({ queryKey: ['teacherStudents'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create student.')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return students.filter((student) => {
      const matchesClass = classFilter === 'All' || student.className === classFilter
      const matchesSearch =
        !term ||
        student.name.toLowerCase().includes(term) ||
        student.className.toLowerCase().includes(term)

      return matchesClass && matchesSearch
    })
  }, [classFilter, search, students])

  const openProfile = (student) => {
    setSelectedStudentId(student.id)
    setProfileOpen(true)
    setError('')
  }

  const closeProfile = () => {
    setProfileOpen(false)
    setSelectedStudentId('')
    setSavingProfile(false)
    setSavingFees(false)
  }

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(`Delete ${student.name || 'this student'}? This cannot be undone.`)

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(student.id)
      setError('')
      await deleteStudentById(student.id)
      queryClient.invalidateQueries({ queryKey: ['teacherStudents'] })
      if (selectedStudentId === student.id) {
        closeProfile()
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete student right now.')
    } finally {
      setDeletingId('')
    }
  }

  const handleSaveProfile = async ({ name, className, createdAt }) => {
    if (!selectedStudentId) {
      return
    }

    try {
      setSavingProfile(true)
      setError('')
      await updateStudentProfile(selectedStudentId, { name, className, createdAt })
      queryClient.invalidateQueries({ queryKey: ['studentDetail', selectedStudentId] })
      queryClient.invalidateQueries({ queryKey: ['teacherStudents'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save student details.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePhoto = async (photoFile) => {
    if (!selectedStudentId) {
      return
    }

    try {
      setSavingProfile(true)
      setError('')
      const photoUrl = await uploadStudentPhoto(photoFile)
      if (!photoUrl) {
        throw new Error('Failed to upload photo')
      }
      await updateStudentProfile(selectedStudentId, { photo: photoUrl })
      queryClient.invalidateQueries({ queryKey: ['studentDetail', selectedStudentId] })
      queryClient.invalidateQueries({ queryKey: ['teacherStudents'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update photo.')
      throw saveError
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveFees = async ({ totalFees }) => {
    if (!selectedStudentId) {
      return
    }

    try {
      setSavingFees(true)
      setError('')
      await updateStudentFees(selectedStudentId, totalFees)
      queryClient.invalidateQueries({ queryKey: ['studentDetail', selectedStudentId] })
      queryClient.invalidateQueries({ queryKey: ['teacherStudents'] })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save fee settings.')
    } finally {
      setSavingFees(false)
    }
  }

  const totalStudents = students.length

  return (
    <div className="space-y-6">
      {isAdding ? (
        <>
          <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-soft">
            <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  aria-label="Back to students list"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Add New Student</h1>
                  <p className="mt-1 text-sm text-slate-500">Register a new student profile in the Coaching portal.</p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <SectionCard>
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                {error}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Student Information" subtitle="Fill in the student details">
            <form onSubmit={handleAddStudentSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                
                {/* 1. Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter full name"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                {/* 2. Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    placeholder="Enter father's name"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter 10-digit phone number"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                {/* 4. Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password *</label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter portal password"
                      className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-12 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition flex items-center justify-center h-10 w-10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* 5. Class */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Class *</label>
                  <select
                    required
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  >
                    <option value="6th">6th</option>
                    <option value="7th">7th</option>
                    <option value="8th">8th</option>
                    <option value="9th">9th</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                  </select>
                </div>

                {/* 6. School */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">School Name *</label>
                  <input
                    type="text"
                    required
                    value={form.schoolName}
                    onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                    placeholder="Enter school name"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                {/* 7. Board */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Board *</label>
                  <select
                    required
                    value={form.board}
                    onChange={(e) => setForm({ ...form, board: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  >
                    <option value="">Select Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="CGBSE">CGBSE</option>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                  </select>
                </div>

                {/* 8. Medium */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Medium *</label>
                  <select
                    required
                    value={form.medium}
                    onChange={(e) => setForm({ ...form, medium: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  >
                    <option value="">Select Medium</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                  </select>
                </div>

                {/* 9. Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Address *</label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Enter address"
                    rows="2"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                {/* 10. Fees */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Monthly Fees *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.totalFees}
                    onChange={(e) => setForm({ ...form, totalFees: e.target.value })}
                    placeholder="e.g. 1500"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                {/* 11. Admission Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Admission Date *</label>
                  <input
                    type="date"
                    required
                    value={form.createdAt}
                    onChange={(e) => setForm({ ...form, createdAt: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
                  />
                </div>

                {/* 12. Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-slate-700">Profile Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={convertingPhoto}
                    onChange={async (e) => {
                      const file = e.target.files?.[0] || null
                      if (file) {
                        try {
                          setConvertingPhoto(true)
                          setError('')
                          const converted = await convertHeicToJpeg(file)
                          setPhotoFile(converted)
                        } catch (err) {
                          console.error(err)
                          setError(err.message || 'HEIC image conversion failed.')
                          alert(err.message || 'HEIC image conversion failed.')
                          setPhotoFile(null)
                          e.target.value = ''
                        } finally {
                          setConvertingPhoto(false)
                        }
                      } else {
                        setPhotoFile(null)
                      }
                    }}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[15px] text-slate-500 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {convertingPhoto && (
                    <p className="mt-1 text-xs font-semibold text-blue-600 animate-pulse">⏳ Converting HEIC image to JPEG...</p>
                  )}
                </div>

              </div>

              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  disabled={convertingPhoto || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || convertingPhoto}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {convertingPhoto ? 'Converting Image...' : saving ? 'Saving Student...' : 'Add Student'}
                </button>
              </div>
            </form>
          </SectionCard>
        </>
      ) : (
        <>
          <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-soft">
            <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                    <Users className="h-3.5 w-3.5 text-brand" />
                    Raj Tuition Classes
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    Students
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    Keep learner cards fast to scan, then open a compact profile for details, attendance, and fees.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Total Students</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{totalStudents}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95 hover:shadow-lg"
                  >
                    <Plus className="h-4 w-4" />
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          </section>

          <SectionCard>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                Search by name or class.
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Click a card to view and edit a full profile.
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <SearchBar value={search} onChange={(event) => setSearch(event.target.value)} />
              <FilterTabs value={classFilter} options={STUDENT_CLASS_OPTIONS} onChange={setClassFilter} />
            </div>
          </SectionCard>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
                />
              ))}
            </div>
          ) : error ? (
            <SectionCard>
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
                {error}
              </div>
            </SectionCard>
          ) : filteredStudents.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  deleting={deletingId === student.id}
                  onViewProfile={openProfile}
                  onDelete={handleDeleteStudent}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No students found" description="Try a different search term or class filter." />
          )}

          <StudentProfileModal
            open={profileOpen}
            studentDetail={selectedStudentDetail}
            loading={profileLoading}
            savingProfile={savingProfile}
            savingFees={savingFees}
            onClose={closeProfile}
            onSaveProfile={handleSaveProfile}
            onSaveFees={handleSaveFees}
            onUpdatePhoto={handleUpdatePhoto}
          />
        </>
      )}
    </div>
  )
}

export default TeacherStudents
