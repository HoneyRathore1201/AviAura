import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import StarField from '../components/StarField'
import ScrollTravelAnimation from '../components/ScrollTravelAnimation'
import GoogleAuthButton from '../components/GoogleAuthButton'
import Logo from '../components/Logo'

export default function Login() {
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  return (
    <div className="relative min-h-screen flex items-center pt-24 pb-16 px-4">
      <StarField count={40} />

      <div className="relative z-10 mx-auto max-w-6xl w-full">
        <div className="grid items-center gap-10 lg:grid-cols-12">

          {/* Left: Interactive Radar & Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 hidden lg:block"
          >
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Live Route Telemetry</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">AV-RADAR // ACTIVE</span>
              </div>

              <ScrollTravelAnimation className="h-72 w-full" scrollProgress={0.65} />

              <div className="grid grid-cols-3 gap-3">
                {[
                  { city: 'Jaipur', code: 'JAI', tag: 'Royal Palaces' },
                  { city: 'Kyoto', code: 'KYO', tag: 'Temples & Tea' },
                  { city: 'Zurich', code: 'ZRH', tag: 'Alpine Horizons' },
                ].map((d) => (
                  <div
                    key={d.code}
                    className="rounded-2xl border border-white/[0.06] bg-slate-900/50 p-3 text-center"
                  >
                    <p className="text-xs font-semibold text-white">{d.city}</p>
                    <p className="text-[10px] text-amber-400 font-mono mt-0.5">{d.code}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{d.tag}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Google Only Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl text-center">
              <div className="flex flex-col items-center mb-6">
                <Logo className="h-12 w-12 mb-4" />
                <h1 className="font-display text-2xl font-bold text-white">Welcome to Aviaura</h1>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                  Sign in securely using your Google account to access your saved itineraries and custom trip plans.
                </p>
              </div>

              {/* Dedicated Google Sign In Button */}
              <div className="my-6">
                <GoogleAuthButton redirectTo={from} />
              </div>

              {/* Value points */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2 text-left">
                {[
                  'Instant one-click authentication',
                  'Zero passwords to create or remember',
                  'Automatic cloud sync across devices',
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 mt-6 leading-tight">
                By continuing, you agree to Aviaura’s Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
