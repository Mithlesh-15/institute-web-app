function PendingBadge({ amount = 0 }) {
  if (!Number(amount)) {
    return null
  }

  return (
    <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#f25d0d]">
      Pending ₹{Number(amount).toLocaleString('en-IN')}
    </span>
  )
}

export default PendingBadge
