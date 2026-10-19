export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="logoGradSky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      {/* Outer rounded container */}
      <rect width="64" height="64" rx="16" fill="rgba(245, 158, 11, 0.12)" />
      <rect width="64" height="64" rx="16" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" />

      {/* Orbit ring */}
      <ellipse cx="32" cy="35" rx="18" ry="18" stroke="url(#logoGradGold)" strokeWidth="1.6" opacity="0.75" />
      <ellipse cx="32" cy="35" rx="18" ry="7" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="1.2" />

      {/* Jet silhouette */}
      <path
        d="M24 21l12 6-5 2-2 5L22 21z"
        fill="url(#logoGradGold)"
      />

      {/* Center compass coordinate */}
      <circle cx="32" cy="35" r="2.5" fill="#FFFFFF" />

      {/* Accent stars */}
      <circle cx="49" cy="16" r="1.5" fill="#FBBF24" opacity="0.9" />
      <circle cx="53" cy="22" r="1" fill="#F59E0B" opacity="0.7" />
      <circle cx="15" cy="20" r="1" fill="#38BDF8" opacity="0.6" />
    </svg>
  )
}
