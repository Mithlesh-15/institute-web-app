import { useEffect, useState } from 'react'
import { ExternalLink, Megaphone, Plus, Pencil, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import SectionCard from '../../components/teacher-dashboard/SectionCard'
import {
  createTeacherNotice,
  deleteTeacherNotice,
  fetchTeacherNotices,
  updateTeacherNotice,
} from '../../utils/teacherPortal'

function NoticeModal({ open, notice, loading, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [noticeLink, setNoticeLink] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    setTitle(notice?.title || '')
    setNoticeLink(notice?.noticeLink || '')
  }, [open, notice])

  const handleSave = async () => {
    await onSave({
      title,
      noticeLink,
    })
  }

  return (
    <Modal
      open={open}
      title={notice ? 'Edit Notice' : 'Add Notice'}
      description="Publish a clean notice card with a link families can open."
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        <Input label="Notice Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input
          label="Notice Link"
          value={noticeLink}
          onChange={(event) => setNoticeLink(event.target.value)}
          placeholder="https://..."
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading} loadingLabel="Saving notice...">
            Save Notice
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function TeacherNotices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)
  const [deletingId, setDeletingId] = useState('')

  const loadNotices = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchTeacherNotices()
      setNotices(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load notices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotices()
  }, [])

  const handleSave = async ({ title, noticeLink }) => {
    try {
      setSaving(true)
      setError('')
      if (editingNotice) {
        const updated = await updateTeacherNotice(editingNotice.id, { title, noticeLink })
        setNotices((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      } else {
        const created = await createTeacherNotice({ title, noticeLink })
        setNotices((current) => [created, ...current])
      }
      setModalOpen(false)
      setEditingNotice(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save notice.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (notice) => {
    const confirmed = window.confirm(`Delete ${notice.title || 'this notice'}?`)

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(notice.id)
      setError('')
      await deleteTeacherNotice(notice.id)
      setNotices((current) => current.filter((item) => item.id !== notice.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete notice.')
    } finally {
      setDeletingId('')
    }
  }

  const openAddModal = () => {
    setEditingNotice(null)
    setModalOpen(true)
  }

  const openEditModal = (notice) => {
    setEditingNotice(notice)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-soft">
        <div className="bg-[linear-gradient(135deg,rgba(37,99,235,0.09),rgba(29,78,216,0.06),rgba(219,234,254,0.45))] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <Megaphone className="h-3.5 w-3.5 text-brand" />
                Raj Tuition Classes
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Notices
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Post concise updates, then edit or remove them from a clean card layout.
              </p>
            </div>

          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <SectionCard>
          <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : notices.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notices.map((notice) => (
            <article
              key={notice.id}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.09)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900">{notice.title || 'Notice'}</h3>
                  <a
                    href={notice.noticeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 break-all text-sm text-slate-500 transition hover:text-brand"
                  >
                    {notice.noticeLink || 'No link added'}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(notice)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand/25 hover:text-brand"
                    aria-label="Edit notice"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(notice)}
                    disabled={deletingId === notice.id}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                    aria-label="Delete notice"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-soft">
          No notices posted yet.
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-30">
        <Button onClick={openAddModal} className="shadow-[0_18px_40px_rgba(37,99,235,0.28)]">
          <Plus className="h-4 w-4" />
          Add Notice
        </Button>
      </div>

      <NoticeModal
        open={modalOpen}
        notice={editingNotice}
        loading={saving}
        onClose={() => {
          setModalOpen(false)
          setEditingNotice(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}

export default TeacherNotices
