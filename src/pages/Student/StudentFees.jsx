import { useMemo, useState } from 'react'
import { CreditCard, QrCode, Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import FeeCard from '../../components/student-portal/FeeCard'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { fetchStudentFees, formatPortalCurrency } from '../../utils/studentPortal'
import { PAYMENT_CONFIG } from '../../utils/paymentConfig'
import { exportStudentFeesToExcel } from '../../utils/feesExport'

function StudentFees() {
  const [qrOpen, setQrOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' })

  const { data: fees = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['studentFees'],
    queryFn: fetchStudentFees,
    staleTime: 3 * 60 * 60 * 1000, // 3 hours
    gcTime: 3 * 60 * 60 * 1000,    // 3 hours
  })

  const error = queryError ? (queryError.message || 'Unable to load fees right now.') : ''

  const totalPendingAmount = useMemo(() => {
    return fees.reduce((total, fee) => {
      if (fee.status !== 'pending') {
        return total
      }

      return total + Number(fee.pendingAmount || 0)
    }, 0)
  }, [fees])

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type })
    if (type !== 'loading') {
      setTimeout(() => {
        setToast((current) =>
          current.message === message ? { ...current, show: false } : current,
        )
      }, 4000)
    }
  }

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(PAYMENT_CONFIG.qrImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'RTC_Payment_QR.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download QR code:', err)
      const link = document.createElement('a')
      link.href = PAYMENT_CONFIG.qrImageUrl
      link.download = 'RTC_Payment_QR.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleExportFees = async () => {
    setExportLoading(true)
    showToast('Generating report...', 'loading')
    try {
      const result = await exportStudentFeesToExcel((msg) => {
        showToast(msg, 'loading')
      })
      if (result.success) {
        showToast('Report generated successfully', 'success')
      } else {
        showToast(result.message || 'Export failed', 'error')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Export failed', 'error')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Fees
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Fee history</h1>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <Button onClick={() => setQrOpen(true)} className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Pay Fees
              </Button>
              <Button onClick={handleExportFees} loading={exportLoading} variant="secondary" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Fees
              </Button>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <StudentStatCard
              label="Total Pending Amount"
              value={formatPortalCurrency(totalPendingAmount)}
              hint="Pending across all months"
              icon={CreditCard}
              tone="amber"
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : fees.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {fees.map((fee) => (
            <FeeCard key={`${fee.month}-${fee.year}`} fee={fee} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No fee records found yet.
        </div>
      )}

      {/* QR Code Modal */}
      <Modal
        open={qrOpen}
        title="Pay Fees"
        description="Scan QR to complete tuition fee payment."
        onClose={() => setQrOpen(false)}
        size="sm"
      >
        <div className="flex flex-col items-center space-y-6 py-2">
          {/* QR Container */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
            <img
              src={PAYMENT_CONFIG.qrImageUrl}
              alt="Payment QR Code"
              className="h-48 w-48 object-contain"
            />
          </div>

          {/* Download QR Button */}
          <Button onClick={handleDownloadQr} variant="secondary" className="w-full flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Download QR
          </Button>

          {/* Instructions */}
          <div className="w-full space-y-3 rounded-2xl bg-blue-50/50 p-4 border border-blue-100">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Instructions</p>
            <ol className="list-decimal pl-4 text-xs leading-5 text-slate-600 space-y-2">
              {PAYMENT_CONFIG.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ol>
          </div>
        </div>
      </Modal>

      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.15)] transition-all duration-300">
          {toast.type === 'loading' && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2563eb]/40 border-t-[#2563eb]" />
          )}
          {toast.type === 'success' && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">✓</span>
          )}
          {toast.type === 'error' && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">!</span>
          )}
          {toast.type === 'info' && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">i</span>
          )}
          <span className="text-sm font-semibold text-slate-800">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default StudentFees
