import { useMemo } from 'react'

export default function StarField({ count = 50 }) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  }, [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Subtle Warm Amber & Deep Midnight Ambient Glows */}
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full blur-[140px] opacity-[0.07]"
        style={{ background: '#F59E0B' }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full blur-[160px] opacity-[0.05]"
        style={{ background: '#38BDF8' }}
      />
      <div
        className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full blur-[160px] opacity-[0.05]"
        style={{ background: '#D97706' }}
      />

      {/* Delicate Starlight Particles */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-slate-200"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  )
}
