export function PulseBlock({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06] ${className}`}
    />
  )
}

export default function ItinerarySkeleton() {
  return (
    <div className="mx-auto mt-6 grid max-w-4xl gap-4">
      <PulseBlock className="h-28" />
      <PulseBlock className="h-44" />
      <PulseBlock className="h-44" />
      <PulseBlock className="h-44" />
    </div>
  )
}
