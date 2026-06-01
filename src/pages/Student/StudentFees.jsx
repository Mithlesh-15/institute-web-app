import { useMemo } from 'react'
import { CreditCard } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import FeeCard from '../../components/student-portal/FeeCard'
import StudentStatCard from '../../components/student-portal/StudentStatCard'
import { fetchStudentFees, formatPortalCurrency } from '../../utils/studentPortal'

function StudentFees() {
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

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Fees
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Fee history</h1>
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
              className="h-48 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : fees.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {fees.map((fee) => (
            <FeeCard key={`${fee.month}-${fee.year}`} fee={fee} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          No fee records found yet.
        </div>
      )}
    </div>
  )
}

export default StudentFees
