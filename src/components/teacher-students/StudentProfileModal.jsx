import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, Phone, Save, School2, Users } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

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
}) {
  const [activeTab, setActiveTab] = useState('details')
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [totalFees, setTotalFees] = useState('0')

  useEffect(() => {
    if (!open || !studentDetail?.student) {
      return
    }

    setActiveTab('details')
    setName(studentDetail.student.name || '')
    setClassName(studentDetail.student.className || '')
    setTotalFees(String(studentDetail.student.totalFees || 0))
  }, [open, studentDetail])

  const classCount = studentDetail?.classes?.length || 0
  const attendance = studentDetail?.attendance || {}
  const student = studentDetail?.student || null

  const handleSaveProfile = async () => {
    await onSaveProfile?.({
      name,
      className,
    })
  }

  const handleSaveFees = async () => {
    await onSaveFees?.({
      totalFees: Number(totalFees || 0),
    })
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
        <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'rounded-2xl px-4 py-2 text-sm font-semibold transition',
                activeTab === tab.key
                  ? 'bg-white text-[#2563eb] shadow-sm'
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
                className="h-28 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : null}

        {!loading && activeTab === 'details' ? (
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(219,234,254,0.35))]">
                  {student?.photo ? (
                    <img src={student.photo} alt={student?.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#2563eb]">
                      {student?.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                    Student Details
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">{student?.name || 'Student'}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {student?.className || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
                <Input label="Class" value={className} onChange={(event) => setClassName(event.target.value)} />
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  loading={savingProfile}
                  loadingLabel="Saving changes..."
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: 'Class',
                    value: student?.className || 'N/A',
                    icon: School2,
                  },
                  {
                    label: 'Classes',
                    value: `${classCount}`,
                    icon: Users,
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <Icon className="h-4 w-4 text-[#2563eb]" />
                        {item.label}
                      </div>
                      <p className="mt-3 text-lg font-semibold text-slate-900">{item.value}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {!loading && activeTab === 'attendance' ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Attendance', value: formatPercent(attendance.attendancePercentage), tone: 'text-[#2563eb]' },
                { label: 'Present', value: attendance.totalPresent || 0, tone: 'text-green-600' },
                { label: 'Absent', value: attendance.totalAbsent || 0, tone: 'text-red-500' },
                { label: 'Classes', value: classCount, tone: 'text-slate-900' },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className={`mt-3 text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-base font-semibold text-slate-900">All Classes</h4>
                <span className="text-sm font-medium text-slate-500">Attendance from batch and attendance tables</span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {studentDetail?.classes?.length ? (
                  studentDetail.classes.map((classItem) => (
                    <div key={classItem.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{classItem.className || 'Class'}</p>
                          <p className="mt-1 text-sm text-slate-500">{classItem.classLevel || 'Batch class'}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#2563eb] shadow-sm">
                          {formatPercent(classItem.attendancePercentage)}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                          <p className="text-xs text-slate-500">Present</p>
                          <p className="mt-1 font-semibold text-slate-900">{classItem.totalPresent}</p>
                        </div>
                        <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                          <p className="text-xs text-slate-500">Absent</p>
                          <p className="mt-1 font-semibold text-slate-900">{classItem.totalAbsent}</p>
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
        ) : null}

        {!loading && activeTab === 'fees' ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Fees Settings</p>
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
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Current Month</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Student</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{student?.name || 'Student'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Monthly Fees</p>
                    <p className="mt-1 text-2xl font-semibold text-[#2563eb]">₹{Number(totalFees || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
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
