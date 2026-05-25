function FeeStatusBadge({ status }) {
  const isPaid = status === 'paid'

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        isPaid ? 'bg-green-50 text-[#22c55e]' : 'bg-red-50 text-[#ef4444]',
      ].join(' ')}
    >
      {isPaid ? 'Paid' : 'Pending'}
    </span>
  )
}

export default FeeStatusBadge
