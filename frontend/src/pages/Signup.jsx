import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import StarField from '../components/StarField'
import ScrollTravelAnimation from '../components/ScrollTravelAnimation'
import GoogleAuthButton from '../components/GoogleAuthButton'
import Logo from '../components/Logo'

const perks = [
  { icon: '✨', title: 'Personalized Itineraries', desc: 'Curated to your exact budget & dietary guidelines' },
  { icon: '🏨', title: 'Verified Hotel Picks', desc: 'Real properties with transparent pricing' },
  { icon: '🍽️', title: 'Authentic Food Trails', desc: 'Strict pure veg, jain, and regional food gems' },
  { icon: '🗺️', title: 'Interactive Day Maps', desc: 'Day-by-day route navigation and timing' },
]

export default function Signup() {
  const location = useLocation()
  const from = location.state?.from || '/dashboard'

  return (
    <div className="relative min-h-screen flex items-center pt-24 pb-16 px-4">
      <StarField count={40} />

      <div className="relative z-10 mx-auto max-w-6xl w-full">
        <div className="grid items-center gap-10 lg:grid-cols-12">

          {/* Left: Google Sign Up card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl text-center">
              {/* Header */}
              <div className="flex flex-col items-center mb-6">
                <Logo className="h-12 w-12 mb-4" />
                <h1 className="font-display text-2xl font-bold text-white">Create Your Account</h1>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                  Join Aviaura with your Google account. Free forever, no credit card required.
                </p>
              </div>

              {/* Dedicated Google Sign In Button */}
              <div className="my-6">
                <GoogleAuthButton redirectTo={from} />
              </div>

              {/* Trust Points */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2 text-left">
                {[
                  'Instant setup with your Google account',
                  'Save and access unlimited trip blueprints',
                  'Secure, private travel vault with zero spam',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 mt-6 leading-tight">
                By continuing, you agree to Aviaura’s Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>

          {/* Right: Sleek Radar Showcase & Perks */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 hidden lg:block"
          >
            <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
              {/* Radar Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Live Global Route Radar</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">AV-NAV // REAL-TIME</span>
              </div>

              {/* Radar Canvas */}
              <ScrollTravelAnimation className="h-64 w-full" scrollProgress={0.4} />

              {/* Perks Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {perks.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-white/[0.06] bg-slate-900/50 p-4 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.icon}</span>
                      <h4 className="text-xs font-semibold text-white">{p.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
