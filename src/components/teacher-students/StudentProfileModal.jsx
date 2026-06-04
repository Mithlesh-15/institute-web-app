import { useEffect, useMemo, useState, useRef } from 'react'
import { GraduationCap, Phone, Save, School2, Users, Camera, Loader2 } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { convertHeicToJpeg } from '../../utils/studentAuth'

const tabs = [
  { key: 'details', label: 'Student Details' },
  { key: 'attendance', label: 'Classes & Attendance' },
  { key: 'fees', label: 'Fees Settings' },
]

const formatPercent = (value) => `${Number(value || 0)}%`

function StudentProfileModal({
  open,
  studentDetail,
  loading = false,
  savingProfile = false,
  savingFees = false,
  onClose,
  onSaveProfile,
  onSaveFees,
  onUpdatePhoto,
  defaultClassId = null,
}) {
  const [activeTab, setActiveTab] = useState('details')
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [totalFees, setTotalFees] = useState('0')
  const [selectedClassId, setSelectedClassId] = useState(null)
  
  const fileInputRef = useRef(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!open || !studentDetail?.student) {
      return
    }

    setActiveTab('details')
    setName(studentDetail.student.name || '')
    setClassName(studentDetail.student.className || '')
    const rawDate = studentDetail.student.createdAt || studentDetail.student.created_at || ''
    setCreatedAt(rawDate ? rawDate.slice(0, 10) : '')
    setTotalFees(String(studentDetail.student.totalFees || 0))
    setSelectedClassId(defaultClassId)
    setPhotoUploading(false)
    setUploadError('')
  }, [open, studentDetail, defaultClassId])

  const classCount = studentDetail?.classes?.length || 0
  const attendance = studentDetail?.attendance || {}
  const student = studentDetail?.student || null

  const classAttendanceRecords = useMemo(() => {
    if (!studentDetail?.attendance?.rawList || !selectedClassId) return []
    return studentDetail.attendance.rawList.filter((record) => record.classId === selectedClassId)
  }, [studentDetail, selectedClassId])

  const groupedByMonth = useMemo(() => {
    const groups = {}

    const sortedRecords = [...classAttendanceRecords].sort((a, b) => {
      return new Date(b.attendanceDate) - new Date(a.attendanceDate)
    })

    sortedRecords.forEach((record) => {
      const date = new Date(record.attendanceDate)
      if (isNaN(date.getTime())) return

      const monthYear = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })

      if (!groups[monthYear]) {
        groups[monthYear] = []
      }
      groups[monthYear].push(record)
    })

    return groups
  }, [classAttendanceRecords])

  const matchedClassDetail = studentDetail?.classes?.find((c) => c.id === selectedClassId)

  const handleSaveProfile = async () => {
    await onSaveProfile?.({
      name,
      className,
      createdAt: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
    })
  }

  const handleSaveFees = async () => {
    await onSaveFees?.({
      totalFees: Number(totalFees || 0),
    })
  }

  const handlePhotoClick = () => {
    if (photoUploading) return
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setPhotoUploading(true)
      setUploadError('')
      
      const processedFile = await convertHeicToJpeg(file)
      
      if (onUpdatePhoto) {
        await onUpdatePhoto(processedFile)
      }
    } catch (err) {
      console.error(err)
      setUploadError(err instanceof Error ? err.message : 'Failed to update profile photo.')
    } finally {
      setPhotoUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Modal
      open={open}
      title={student?.name || 'Student Profile'}
      description="Review learner details, attendance, and fee settings."
      onClose={onClose}
      size="xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'rounded-2xl px-4 py-2 text-sm font-semibold transition',
                activeTab === tab.key
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : null}

        {!loading && activeTab === 'details' ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div 
                  onClick={handlePhotoClick}
                  className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.35))] cursor-pointer hover:border-brand/40 transition duration-300"
                >
                  {student?.photo ? (
                    <img src={student.photo} alt={student?.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-brand">
                      {student?.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
                    <Camera className="h-5 w-5" />
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Change</span>
                  </div>

                  {/* Loading Overlay */}
                  {photoUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                      <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-200">Updating...</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                    Student Profile
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">{student?.name || 'Student'}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Class {student?.className || 'N/A'}
                    </span>
                  </div>
                  {uploadError && (
                    <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>
                  )}
                </div>
              </div>

              <hr className="my-6 border-slate-100" />

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* 1. Student Name */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>

                {/* 2. Father's Name */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Father's Name
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 wrap-break-word py-1">
                    {student?.fatherName || 'N/A'}
                  </p>
                </div>

                {/* 3. Phone Number */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Phone Number
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 wrap-break-word py-1">
                    {student?.phone || 'N/A'}
                  </p>
                </div>

                {/* 4. Class */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Class
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  >
                    {['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG'].map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Admission Date */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={createdAt}
                    onChange={(e) => setCreatedAt(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>

                {/* 6. School Name */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    School Name
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 wrap-break-word py-1">
                    {student?.schoolName || 'N/A'}
                  </p>
                </div>

                {/* 7. Medium */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Medium
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 wrap-break-word py-1">
                    {student?.medium || 'N/A'}
                  </p>
                </div>

                {/* 8. Board */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Board
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 wrap-break-word py-1">
                    {student?.board || 'N/A'}
                  </p>
                </div>

                {/* 9. Address */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Address
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 wrap-break-word py-1">
                    {student?.address || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Save Profile Button */}
              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  loading={savingProfile}
                  loadingLabel="Saving profile..."
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'attendance' ? (
          <div className="space-y-5">
            {selectedClassId ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <button
                    type="button"
                    onClick={() => setSelectedClassId(null)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand/20 hover:text-brand"
                  >
                    &larr; Back to Classes
                  </button>
                  <div className="text-right">
                    <h4 className="text-lg font-semibold text-slate-900">
                      {matchedClassDetail?.className || 'Class'} Attendance
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                      Class Level: {matchedClassDetail?.classLevel || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Percentage</p>
                    <p className="mt-2 text-xl font-bold text-brand">
                      {formatPercent(matchedClassDetail?.attendancePercentage)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Present</p>
                    <p className="mt-2 text-xl font-bold text-green-600">{matchedClassDetail?.totalPresent || 0}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Absent</p>
                    <p className="mt-2 text-xl font-bold text-red-500">{matchedClassDetail?.totalAbsent || 0}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.keys(groupedByMonth).length ? (
                    Object.entries(groupedByMonth).map(([monthYear, records]) => (
                      <div key={monthYear} className="space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-l-4 border-brand pl-2.5">
                          {monthYear}
                        </h5>

                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {records.map((record) => {
                            const dateObj = new Date(record.attendanceDate)
                            const formattedDate = dateObj.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })
                            const isPresent = record.status === 'present'

                            return (
                              <div
                                key={record.id}
                                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition hover:shadow-soft"
                              >
                                <span className="text-sm font-medium text-slate-800">{formattedDate}</span>
                                <span
                                  className={[
                                    'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm',
                                    isPresent
                                      ? 'bg-green-50 text-green-700 border border-green-200'
                                      : 'bg-red-50 text-red-600 border border-red-200',
                                  ].join(' ')}
                                >
                                  {isPresent ? 'Present' : 'Absent'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                      No attendance records found for this class.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Attendance', value: formatPercent(attendance.attendancePercentage), tone: 'text-brand' },
                    { label: 'Present', value: attendance.totalPresent || 0, tone: 'text-green-600' },
                    { label: 'Absent', value: attendance.totalAbsent || 0, tone: 'text-red-500' },
                    { label: 'Classes', value: classCount, tone: 'text-slate-900' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <p className={`mt-3 text-2xl font-bold ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-base font-semibold text-slate-900">All Classes</h4>
                    <span className="text-xs font-medium text-slate-400">Click any class below to see month-wise day-by-day attendance</span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {studentDetail?.classes?.length ? (
                      studentDetail.classes.map((classItem) => (
                        <div
                          key={classItem.id}
                          onClick={() => setSelectedClassId(classItem.id)}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-brand transition-colors">{classItem.className || 'Class'}</p>
                              <p className="mt-1 text-xs text-slate-500">{classItem.classLevel || 'Batch class'}</p>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand shadow-sm">
                              {formatPercent(classItem.attendancePercentage)}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-sm">
                              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Present</p>
                              <p className="mt-0.5 font-bold text-slate-900">{classItem.totalPresent}</p>
                            </div>
                            <div className="rounded-2xl bg-white px-3 py-2.5 shadow-sm">
                              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Absent</p>
                              <p className="mt-0.5 font-bold text-slate-900">{classItem.totalAbsent}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 md:col-span-2">
                        No class assignments found for this student.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!loading && activeTab === 'fees' ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Fees Settings</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">Total Fees</h3>
              <p className="mt-2 text-sm text-slate-500">Set the monthly amount used by the current fee cycle.</p>

              <div className="mt-5">
                <Input
                  label="Total Fees"
                  type="number"
                  min="0"
                  value={totalFees}
                  onChange={(event) => setTotalFees(event.target.value)}
                  placeholder="5000"
                />
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveFees}
                  loading={savingFees}
                  loadingLabel="Saving fees..."
                >
                  <Save className="h-4 w-4" />
                  Save Fees
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Current Month</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Student</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{student?.name || 'Student'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Monthly Fees</p>
                    <p className="mt-1 text-2xl font-semibold text-brand">₹{Number(totalFees || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
                <p className="text-sm font-semibold text-slate-700">Current fee rule</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Each new month will create a pending record automatically using this amount.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StudentProfileModal
