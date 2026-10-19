import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import StarField from '../components/StarField'
import Logo from '../components/Logo'

const values = [
  {
    icon: '💎',
    title: 'Zero Generic Fluff',
    desc: 'We never recommend vague "explore local markets" or non-existent restaurants. Every recommendation is an exact, verified venue with true pricing.',
  },
  {
    icon: '⚖️',
    title: 'Honest Budget Accounting',
    desc: 'True travel expenses include taxis, tips, monument entry, and dining per person. We calculate the real whole-group cost so there are no surprises.',
  },
  {
    icon: '🌱',
    title: 'Culinary Integrity',
    desc: 'Dietary choices are sacred. Whether 100% Pure Veg, Jain (no root veg), or regional non-veg specialties, we strictly honor food preferences.',
  },
  {
    icon: '🌤️',
    title: 'Meteorological Intelligence',
    desc: 'Live 5-day forecasts integrated with rain backups, so you never get stuck at an open-air fort during a torrential downpour.',
  },
]

const stats = [
  { value: '50K+', label: 'Itineraries Curated' },
  { value: '120+', label: 'Verified Global Cities' },
  { value: '98%', label: 'Budget Calibration Rate' },
  { value: '4.9/5', label: 'Traveler Satisfaction' },
]

export default function About() {
  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4">
      <StarField count={45} />

      <div className="relative z-10 mx-auto max-w-5xl space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <span className="badge-gold inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Our Craft & Philosophy
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            The art of intentional travel,
            <br />
            <span className="gradient-text-gold">engineered with precision.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Aviaura was founded on a simple conviction: modern travelers deserve better than generic AI lists,
            hallucinated hotel rates, and disconnected itineraries that ignore reality.
          </p>
        </div>

        {/* Story Section */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-6">
            <Logo className="h-10 w-10 shrink-0" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">The Aviaura Story</h2>
              <p className="text-xs text-amber-400 font-mono">Bespoke Travel Intelligence · Est. 2024</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-300 leading-relaxed">
            <p>
              Like many travelers, we grew frustrated with planning trips using standard search engines and modern chatbots.
              They gave poetic recommendations like <em>"wander through the old bazaar"</em>, but failed to mention that the bazaar was closed on Mondays,
              or suggested a dinner spot without knowing whether a family required strictly 100% Pure Vegetarian dining.
            </p>
            <p>
              We built <strong>Aviaura</strong> to fuse deep geographical knowledge, verified pricing data, and real-time APIs
              with our signature intelligent concierge, <strong>AURA AI</strong>. The result is a travel architect that designs full-scale,
              day-by-day journeys in under 60 seconds with mathematical budget precision.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div>
          <div className="text-center mb-10">
            <span className="badge-gold text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
              ✦ How We Operate
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3">
              The Four Pillars of Aviaura
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="glass-card rounded-2xl p-6 border border-white/[0.08] hover:border-amber-500/30 transition space-y-2.5"
              >
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
                  {v.icon}
                </div>
                <h3 className="font-display text-base font-semibold text-white">{v.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 bg-slate-900/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
                  {s.value}
                </div>
                <div className="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 text-center space-y-4">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Experience the difference on your next journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Design your personalized itinerary with exact hotel picks, verified dining, and real budget accounting today.
          </p>
          <div className="pt-2">
            <Link
              to="/plan"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-display text-sm font-semibold text-slate-950"
            >
              <span>Design Your Trip</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
