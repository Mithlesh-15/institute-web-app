import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button'
import FeeStatusBadge from './FeeStatusBadge'

function EditPendingModal({ open, fee, onClose, onSave, loading = false }) {
  const [status, setStatus] = useState('pending')
  const [pendingAmount, setPendingAmount] = useState('0')
  const [paymentDate, setPaymentDate] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open || !fee) {
      return
    }

    setStatus(fee.status || 'pending')
    setPendingAmount(String(fee.pendingAmount ?? 0))
    setPaymentDate(fee.paymentDate || new Date().toISOString().slice(0, 10))
    setFormError('')
  }, [fee, open])

  if (!open || !fee) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedAmount = Number(pendingAmount || 0)
    const nextStatus = normalizedAmount <= 0 ? 'paid' : status

    if (!fee.month || !fee.year) {
      setFormError('Missing fee month or year.')
      return
    }

    setFormError('')

    try {
      await onSave({
        fee,
        status: nextStatus,
        pendingAmount: nextStatus === 'paid' ? 0 : normalizedAmount,
        paymentDate: nextStatus === 'paid' ? paymentDate : null,
      })
    } catch (saveError) {
      setFormError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to update pending fee right now.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Edit previous pending
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {fee.month} {fee.year}
            </h2>
            <div className="mt-2">
              <FeeStatusBadge status={status} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-brand/20 hover:bg-slate-50 hover:text-brand"
            aria-label="Close edit pending modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Pending amount</p>
            <input
              type="number"
              min="0"
              value={pendingAmount}
              onChange={(event) => setPendingAmount(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
            <p className="mt-2 text-xs text-slate-500">
              If the amount becomes 0, the status will automatically become paid.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">Status</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={[
                  'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                  status === 'paid'
                    ? 'border-success bg-success text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-success/30 hover:text-success',
                ].join(' ')}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={[
                  'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                  status === 'pending'
                    ? 'border-[#ef4444] bg-[#ef4444] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-[#ef4444]/30 hover:text-[#ef4444]',
                ].join(' ')}
              >
                Pending
              </button>
            </div>
          </div>

          {status === 'paid' && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <label className="block">
                <span className="block text-sm font-semibold text-slate-700 mb-2">Payment Date</span>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/15"
                />
              </label>
            </div>
          )}

          {formError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} loadingLabel="Updating fee...">
              Update Pending
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPendingModal
