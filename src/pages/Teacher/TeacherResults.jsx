import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipboardList, Plus, Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import {
  createTeacherTest,
  fetchTeacherClassesForDropdown,
  fetchTeacherTests,
  fetchTestDetails,
  saveTestResults,
} from '../../utils/teacherPortal'
import FilterTabs from '../../components/teacher-classes/FilterTabs'

function AddTestModal({ open, classes, loading, onClose, onSave }) {
  const [testName, setTestName] = useState('')
  const [classId, setClassId] = useState('')
  const [subject, setSubject] = useState('')
  const [testDate, setTestDate] = useState('')
  const [totalMarks, setTotalMarks] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    setTestName('')
    setClassId(classes[0]?.id || '')
    setSubject('')
    setTestDate('')
    setTotalMarks('')
  }, [open, classes])

  const selectedClass = classes.find((item) => item.id === classId)

  const handleSave = async () => {
    await onSave({
      testName,
      classId,
      className: selectedClass?.className || '',
      subject,
      testDate,
      totalMarks: Number(totalMarks || 0),
    })
  }

  return (
    <Modal
      open={open}
      title="Add Test"
      description="Create a new test and load students into the result sheet."
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <Input label="Test Name" value={testName} onChange={(event) => setTestName(event.target.value)} />
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Class</span>
          <select
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15"
          >
            <option value="">Select class</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.className || classItem.classLevel || 'Class'}
              </option>
            ))}
          </select>
        </label>
        <Input label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        <Input label="Test Date" type="date" value={testDate} onChange={(event) => setTestDate(event.target.value)} />
        <Input
          label="Total Marks"
          type="number"
          min="0"
          value={totalMarks}
          onChange={(event) => setTotalMarks(event.target.value)}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading} loadingLabel="Saving test...">
            Save Test
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function StudentResultRow({ student, resultState, totalMarks, onChange }) {
  const marksDisabled = Boolean(resultState.absent)

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900">{student.name || 'Student'}</p>
          <p className="mt-1 text-sm text-slate-500">{student.className || 'Class N/A'}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(resultState.absent)}
              onChange={(event) => onChange(student.id, { absent: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]"
            />
            Mark absent
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Marks
            </span>
            <input
              type="number"
              min="0"
              max={totalMarks || undefined}
              disabled={marksDisabled}
              value={marksDisabled ? '' : resultState.marks ?? ''}
              onChange={(event) => onChange(student.id, { marks: event.target.value, absent: false })}
              className="w-40 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              placeholder="Enter marks"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

function TeacherResults() {
  const navigate = useNavigate()
  const params = useParams()
  const [tests, setTests] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentTest, setCurrentTest] = useState(null)
  const [students, setStudents] = useState([])
  const [studentRows, setStudentRows] = useState({})
  const [classFilter, setClassFilter] = useState('All')

  const testId = params.testId || ''

  const loadOverview = async () => {
    try {
      setLoading(true)
      setError('')
      const [testRows, classRows] = await Promise.all([
        fetchTeacherTests(),
        fetchTeacherClassesForDropdown(),
      ])
      setTests(testRows)
      setClasses(classRows)
    } catch (overviewError) {
      setError(overviewError instanceof Error ? overviewError.message : 'Unable to load results.')
    } finally {
      setLoading(false)
    }
  }

  const loadDetail = async (selectedTestId) => {
    if (!selectedTestId) {
      setCurrentTest(null)
      setStudents([])
      setStudentRows({})
      return
    }

    try {
      setDetailLoading(true)
      setError('')
      const detail = await fetchTestDetails(selectedTestId)
      setCurrentTest(detail.test)
      setStudents(detail.students)
      setStudentRows(
        detail.students.reduce((accumulator, student) => {
          accumulator[student.id] = {
            marks: student.result?.marks ?? '',
            absent: Boolean(student.result?.absent),
          }
          return accumulator
        }, {}),
      )
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : 'Unable to load test details.')
      setCurrentTest(null)
      setStudents([])
      setStudentRows({})
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [])

  useEffect(() => {
    loadDetail(testId)
  }, [testId])

  const handleAddTest = async ({ testName, classId, className, subject, testDate, totalMarks }) => {
    try {
      setSaving(true)
      setError('')
      const test = await createTeacherTest({
        testName,
        classId,
        className,
        subject,
        testDate,
        totalMarks,
      })
      setModalOpen(false)
      await loadOverview()
      navigate(`/teacher/results/${test.id}`, { replace: true })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to create test.')
    } finally {
      setSaving(false)
    }
  }

  const handleStudentChange = (studentId, patch) => {
    setStudentRows((current) => {
      const previous = current[studentId] || { marks: '', absent: false }
      const next = {
        ...previous,
        ...patch,
      }

      if (Object.prototype.hasOwnProperty.call(patch, 'absent') && patch.absent) {
        next.marks = ''
      }

      return {
        ...current,
        [studentId]: next,
      }
    })
  }

  const handleSaveResults = async () => {
    if (!currentTest) {
      return
    }

    try {
      setSaving(true)
      setError('')
      await saveTestResults(
        currentTest.id,
        students.map((student) => ({
          studentId: student.id,
          marks: studentRows[student.id]?.marks,
          absent: Boolean(studentRows[student.id]?.absent),
        })),
      )
      await loadDetail(currentTest.id)
      await loadOverview()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save results.')
    } finally {
      setSaving(false)
    }
  }

  const groupedTests = useMemo(() => {
    return tests.reduce((accumulator, test) => {
      const key = test.classId || 'Unassigned'

      const matchedClass = classes.find((classItem) => classItem.id === test.classId)
      const classLevel = matchedClass?.classLevel || 'Unassigned'
      const classLabel = matchedClass?.className || test.className || 'Unassigned'

      if (classFilter !== 'All' && classLevel !== classFilter) {
        return accumulator
      }

      if (!accumulator[key]) {
        accumulator[key] = {
          classLabel,
          items: [],
        }
      }
      accumulator[key].items.push(test)
      return accumulator
    }, {})
  }, [classes, tests, classFilter])

  const summary = useMemo(() => {
    const presentStudents = students.filter((student) => !studentRows[student.id]?.absent)
    const absentStudents = students.filter((student) => studentRows[student.id]?.absent)
    const totalMarks = Number(currentTest?.totalMarks || 0)
    const scoredMarks = presentStudents.reduce(
      (total, student) => total + Number(studentRows[student.id]?.marks || 0),
      0,
    )
    const maxMarks = totalMarks * presentStudents.length

    return {
      totalStudents: students.length,
      absentStudents,
      presentCount: presentStudents.length,
      absentCount: absentStudents.length,
      scorePercentage: maxMarks ? Math.round((scoredMarks / maxMarks) * 100) : 0,
    }
  }, [currentTest?.totalMarks, studentRows, students])

  const currentClassName =
    classes.find((classItem) => classItem.id === currentTest?.classId)?.className ||
    currentTest?.className ||
    'Class'

  if (testId) {
    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <button
                  type="button"
                  onClick={() => navigate('/teacher/results')}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#2563eb]/20 hover:text-[#2563eb]"
                >
                  &larr; Back to Tests
                </button>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {currentTest?.testName || 'Test Details'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Grade this test by entering marks or marking absentees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {detailLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : currentTest ? (
          <SectionCard
            title={currentTest?.testName || 'Test Details'}
            subtitle="Result sheet"
            action={
              <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {currentClassName}
              </div>
            }
          >
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Total Students', value: summary.totalStudents },
                  { label: 'Present', value: summary.presentCount },
                  { label: 'Absent', value: summary.absentCount },
                  { label: 'Score %', value: `${summary.scorePercentage}%` },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Test</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentTest.testName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Class</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentClassName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Subject</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentTest.subject || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Total Marks</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentTest.totalMarks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {students.length ? (
                  students.map((student) => (
                    <StudentResultRow
                      key={student.id}
                      student={student}
                      resultState={studentRows[student.id] || { marks: '', absent: false }}
                      totalMarks={currentTest.totalMarks}
                      onChange={handleStudentChange}
                    />
                  ))
                ) : (
                  <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No students found for this class.
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-soft">
                <p className="text-sm font-semibold text-slate-700">Absent Students</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.absentStudents.length ? (
                    summary.absentStudents.map((student) => (
                      <span
                        key={student.id}
                        className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                      >
                        {student.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No absentees marked.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveResults} loading={saving} loadingLabel="Saving results...">
                  <Save className="h-4 w-4" />
                  Save Results
                </Button>
              </div>
            </div>
          </SectionCard>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Select a test to view and edit results.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <ClipboardList className="h-3.5 w-3.5 text-[#2563eb]" />
                Raj Tuition Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Results
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Create tests, then capture marks and absentees in a clean result sheet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SectionCard title="Filter results" subtitle="Class-wise view">
        <FilterTabs
          value={classFilter}
          options={['All', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'UG', 'PG']}
          onChange={setClassFilter}
        />
      </SectionCard>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : Object.keys(groupedTests).length ? (
        <div className="space-y-5">
          {Object.entries(groupedTests).map(([groupKey, group]) => (
            <SectionCard
              key={groupKey}
              title={group.classLabel}
              subtitle="Recent assessments"
              className="bg-white"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.items.map((test) => (
                  <button
                    type="button"
                    key={test.id}
                    onClick={() => navigate(`/teacher/results/${test.id}`)}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{test.testName || 'Untitled Test'}</h3>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shrink-0">
                        {test.totalMarks || 0} marks
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                      <span>{test.subject || 'No subject'}</span>
                      <span>•</span>
                      <span>{test.testDate || 'No date'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {classFilter === 'All'
            ? 'No tests added yet.'
            : `No tests added for Class ${classFilter} yet.`}
        </div>
      )}

      <AddTestModal
        open={modalOpen}
        classes={classes}
        loading={saving}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTest}
      />

      <div className="fixed bottom-6 right-6 z-30">
        <Button onClick={() => setModalOpen(true)} className="shadow-[0_18px_40px_rgba(37,99,235,0.28)]">
          <Plus className="h-4 w-4" />
          Add Test
        </Button>
      </div>
    </div>
  )
}

export default TeacherResults
