import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import StarField from '../components/StarField'

const quickTrips = [
  {
    destination: 'Jaipur, Rajasthan',
    days: 3,
    budget: 28000,
    food: 'veg_only',
    foodLabel: '🌱 Pure Veg',
    hotel: 'Umaid Bhawan Heritage',
    tag: 'Royalty & Culture',
    highlights: ['Amber Fort', 'Hawa Mahal', 'LMB Sweets'],
    emoji: '🏯',
    color: '#F59E0B',
  },
  {
    destination: 'North & South Goa',
    days: 4,
    budget: 36000,
    food: 'non_veg',
    foodLabel: '🍗 Fresh Seafood',
    hotel: 'Santana Beach Resort',
    tag: 'Coastal & Chill',
    highlights: ['Anjuna Sunset', "Fisherman's Wharf", 'Fontainhas Walk'],
    emoji: '🏖️',
    color: '#38BDF8',
  },
  {
    destination: 'Manali & Solang',
    days: 5,
    budget: 32000,
    food: 'all',
    foodLabel: '🥑 Mountain Dining',
    hotel: 'The Himalayan Boutique',
    tag: 'Snow & Adventure',
    highlights: ['Solang Valley', 'Old Manali Cafes', 'Jogini Falls'],
    emoji: '🏔️',
    color: '#10B981',
  },
  {
    destination: 'Kyoto, Japan',
    days: 5,
    budget: 135000,
    food: 'all',
    foodLabel: '🍜 Ramen & Matcha',
    hotel: 'Ryokan Gion Sano',
    tag: 'Heritage & Temples',
    highlights: ['Fushimi Inari', 'Arashiyama Grove', 'Nishiki Market'],
    emoji: '⛩️',
    color: '#F59E0B',
  },
]

const dayPlans = {
  1: [
    { time: '09:30', label: 'Sightseeing', title: 'City Palace & Jantar Mantar', desc: 'Explore royal courtyards and the UNESCO astronomical observatory.', cost: '₹800', badge: 'monument' },
    { time: '12:30', label: '🌱 LMB · Pure Veg', title: 'Traditional Rajasthani Thali', desc: 'Iconic feast: Dal Baati Churma, Ker Sangri, warm Ghewar.', cost: '₹1,100', badge: 'dining' },
    { time: '20:30', label: '🏨 Umaid Bhawan Heritage', title: 'Overnight in Classic Haveli Room', desc: 'Boutique courtyard hotel with rooftop pool and traditional frescoes.', cost: '₹3,400/night', badge: 'stay' },
  ],
  2: [
    { time: '09:00', label: 'Monument', title: 'Amber Fort & Sheesh Mahal', desc: 'Majestic hilltop fortress with stunning mirror mosaic palace.', cost: '₹400', badge: 'monument' },
    { time: '13:30', label: '🌱 1135 AD Amber Fort', title: 'Lunch Overlooking Fort Walls', desc: 'Historic atmosphere with authentic local cuisine.', cost: '₹1,800', badge: 'dining' },
    { time: '17:30', label: 'Sunset View', title: 'Padao Cafe at Nahargarh Fort', desc: 'Spectacular panoramic sunset over the Pink City horizon.', cost: '₹600', badge: 'activity' },
  ],
  3: [
    { time: '10:00', label: 'Art & History', title: 'Albert Hall Central Museum', desc: 'Indo-Saracenic museum showcasing rare carpets and miniature paintings.', cost: '₹300', badge: 'monument' },
    { time: '13:00', label: '🌱 Masala Chowk', title: 'Casual Lunch & Pyaaz Kachoris', desc: 'Open-air gathering of Jaipur\'s most famous heritage street vendors.', cost: '₹500', badge: 'dining' },
    { time: '15:00', label: 'Bazaars', title: 'Bapu Bazaar & Johari Bazaar', desc: 'Handcrafted textiles, blue pottery, and artisanal block-print quilts.', cost: '₹2,000', badge: 'shopping' },
  ],
}

const features = [
  { icon: '🗺️', title: 'Dynamic Route Mapping', desc: 'Intelligent day-by-day route optimization with interactive Leaflet navigation' },
  { icon: '🌤️', title: 'Live Weather Sync', desc: 'OpenWeather 5-day integration built directly into your schedule' },
  { icon: '🍽️', title: 'Verified Dining Guides', desc: 'Real culinary picks with exact menus, pure-veg verification, and prices' },
  { icon: '🏨', title: 'Curated Hotel Stays', desc: 'Hand-picked boutique stays and heritage havelis with realistic rates' },
  { icon: '💸', title: 'Honest Budgeting', desc: 'Zero guesswork — transparent cost breakdown per person, per day, per category' },
  { icon: '🤖', title: 'Dedicated Travel Concierge', desc: 'In-app smart assistant ready to tweak plans, suggest alternatives, and advise' },
]

const stats = [
  { value: '50K+', label: 'Trips Planned', icon: '✈️' },
  { value: '120+', label: 'Destinations', icon: '🌍' },
  { value: '98%', label: 'Budget Accuracy', icon: '💎' },
  { value: '4.9★', label: 'User Rating', icon: '⭐' },
]

export default function Landing() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0])
  const heroScale = useTransform(scrollY, [0, 450], [1, 1.05])
  const heroTextY = useTransform(scrollY, [0, 350], [0, -40])

  const [simDays, setSimDays] = useState(3)
  const [simPeople, setSimPeople] = useState(2)
  const [simFoodType, setSimFoodType] = useState('veg_only')
  const [activeDayTab, setActiveDayTab] = useState(1)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)

  const stayCostPerNight = 3200
  const roomsNeeded = Math.ceil(simPeople / 2)
  const totalStay = stayCostPerNight * roomsNeeded * (simDays - 1)
  const foodPerPersonDay = simFoodType === 'veg_only' ? 850 : 1200
  const totalFood = foodPerPersonDay * simPeople * simDays
  const cabsNeeded = Math.ceil(simPeople / 4)
  const totalTransit = 900 * cabsNeeded * simDays
  const totalActivities = 600 * simPeople * simDays
  const estimatedTotal = totalStay + totalFood + totalTransit + totalActivities

  const inr = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  function launchQuickPlan(trip) {
    navigate('/plan', {
      state: {
        destination: trip.destination.split(',')[0],
        duration_days: trip.days,
        total_budget: trip.budget,
        food_preference: trip.food,
      },
    })
  }

  const badgeColors = {
    monument: 'badge-rose',
    dining: 'badge-emerald',
    stay: 'badge-sky',
    activity: 'badge-gold',
    shopping: 'badge-gold',
  }

  return (
    <div className="relative min-h-screen">
      <StarField count={45} />

      {/* ────── HERO ────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <motion.div
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/hero_bg.jpg"
            alt="Santorini twilight coastal vista"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle cinematic gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/70 to-[#080B11]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B11]/90 via-[#080B11]/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-32 pb-20 w-full">
          <motion.div style={{ y: heroTextY }} className="max-w-3xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full glass px-4 py-1.5 mb-6 border border-white/[0.08]">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-slate-200 tracking-wide">
                Smart Travel Architecture · Real Budgets · Verified Stays
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight text-white">
              Your perfect trip,
              <br />
              <span className="gradient-text-gold">curated to perfection.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              Aviaura builds realistic, tailored itineraries with exact boutique hotel picks,
              verified local dining spots, live weather forecasts, and route maps — strictly calibrated to your actual budget.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/plan"
                id="hero-cta-plan"
                className="btn-primary rounded-full px-8 py-4 font-display text-sm font-semibold text-slate-950 inline-flex items-center gap-2.5"
              >
                <span>Start Planning</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href="#showcase"
                id="hero-cta-explore"
                className="btn-ghost rounded-full px-7 py-4 font-display text-sm font-medium text-white inline-flex items-center gap-2"
              >
                <span>See Live Demo</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6">
              {['Jaipur', 'Goa', 'Manali', 'Kyoto', 'Santorini', 'Zurich'].map((dest) => (
                <span key={dest} className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span className="h-1 w-1 rounded-full bg-amber-400" />
                  {dest}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Floating Luxury Destination Showcase Cards */}
          <div className="absolute right-4 lg:right-6 xl:right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 w-[340px] xl:w-[360px] z-20 pointer-events-auto">
            {[
              {
                city: 'Jaipur, Rajasthan',
                short: 'Jaipur',
                days: '3 Days',
                budget: '₹28,000',
                emoji: '🏯',
                tag: 'Royal Heritage',
                stay: '🏨 Umaid Bhawan Haveli',
                food: '🌱 100% Pure Veg Cuisine',
                rating: '4.98',
                offset: '0px',
                floatDuration: 6.2,
                floatY: -12,
                tripData: quickTrips[0],
              },
              {
                city: 'North & South Goa',
                short: 'Goa',
                days: '4 Days',
                budget: '₹36,000',
                emoji: '🏖️',
                tag: 'Coastal Retreat',
                stay: '🏨 Santana Beachfront Resort',
                food: '🍗 Fresh Catch & Cafes',
                rating: '4.94',
                offset: '-16px',
                floatDuration: 7.5,
                floatY: -16,
                tripData: quickTrips[1],
              },
              {
                city: 'Kyoto, Japan',
                short: 'Kyoto',
                days: '5 Days',
                budget: '₹1,35,000',
                emoji: '⛩️',
                tag: 'Ryokan & Temples',
                stay: '🏨 Ryokan Gion Sano',
                food: '🍵 Matcha & Food Trail',
                rating: '4.99',
                offset: '8px',
                floatDuration: 6.8,
                floatY: -10,
                tripData: quickTrips[3],
              },
            ].map((card, idx) => (
              <motion.div
                key={card.city}
                animate={{
                  x: [0, idx % 2 === 0 ? 6 : -6, 0],
                  y: [0, card.floatY, 0],
                  rotate: [0, idx % 2 === 0 ? 0.7 : -0.7, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: card.floatDuration,
                  ease: 'easeInOut',
                }}
                whileHover={{
                  scale: 1.04,
                  y: -6,
                  transition: { duration: 0.2 },
                }}
                onClick={() => launchQuickPlan(card.tripData)}
                style={{ marginLeft: card.offset }}
                className="rounded-2xl p-4 border border-white/20 hover:border-amber-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.88)] hover:shadow-[0_25px_60px_rgba(245,158,11,0.25)] cursor-pointer group transition-all bg-[#0c1322] backdrop-blur-2xl ring-1 ring-white/10 hover:ring-amber-500/40"
              >
                {/* Header Tag + Rating */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="badge-gold text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    ✦ {card.tag}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <span>★</span>
                    <span>{card.rating}</span>
                  </span>
                </div>

                {/* Main Content */}
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    {card.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-white text-sm group-hover:text-amber-300 transition-colors truncate">
                      {card.city}
                    </h3>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5 font-medium">
                      {card.stay}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                      {card.food}
                    </p>
                  </div>
                </div>

                {/* Footer: Budget + Action */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.12] flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-amber-400 font-mono font-extrabold text-base tracking-tight">
                      {card.budget}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      · {card.days} (2 travelers)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                    Plan <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Scroll to explore</span>
          <div className="h-6 w-3.5 rounded-full border border-white/20 flex items-start justify-center pt-1">
            <div className="h-1.5 w-1 rounded-full bg-amber-400 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ────── STATS ────── */}
      <section ref={statsRef} className="relative z-10 py-16 border-y border-white/[0.06] bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={statsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card rounded-2xl p-6 text-center border border-white/[0.06]"
              >
                <div className="text-2xl mb-1.5">{stat.icon}</div>
                <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── LIVE SHOWCASE ────── */}
      <section id="showcase" className="relative z-10 py-24 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="badge-gold text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
              ✦ Live Itinerary Blueprint
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">
              Jaipur Royal Explorer
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              3 Days · ₹28,000 for 2 · Pure Veg · Moderate Pace
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            {/* Day tab selector */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/40">
              <div className="flex items-center gap-3">
                <Logo className="h-9 w-9 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold text-white">Curated Timeline</span>
                    <span className="badge-emerald text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Exact venues · Realistic travel times · Clear costs</p>
                </div>
              </div>

              {/* Day tabs */}
              <div className="flex rounded-xl glass border border-white/10 p-1 gap-1">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setActiveDayTab(d)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      activeDayTab === d
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-0">
              {/* Timeline Items */}
              <div className="lg:col-span-2 p-6 space-y-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDayTab}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3"
                  >
                    {dayPlans[activeDayTab].map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-4 p-4 rounded-2xl border border-white/[0.06] bg-slate-900/50 hover:bg-slate-900/70 transition-all"
                      >
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="h-2 w-2 rounded-full mt-1.5 bg-amber-400 shrink-0" />
                          {i < 2 && <div className="w-px flex-1 min-h-6 bg-white/[0.08]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-amber-400 font-mono">{item.time}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColors[item.badge]}`}>
                              {item.label}
                            </span>
                          </div>
                          <h3 className="mt-1 font-display text-sm font-semibold text-white">{item.title}</h3>
                          <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xs font-semibold text-slate-200">{item.cost}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sidebar: Weather & Budget */}
              <div className="p-6 border-l border-white/[0.08] bg-slate-900/20 space-y-4">
                {/* Weather card */}
                <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Forecast</h4>
                    <span className="text-xs text-amber-400 font-medium">☀️ Clear Skies</span>
                  </div>
                  <div className="mt-2.5 flex items-baseline justify-between">
                    <span className="font-display text-3xl font-bold text-white">31°C</span>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">High 34° · Low 24°</p>
                      <p className="text-[11px] text-emerald-400 mt-0.5">✓ Optimal for sightseeing</p>
                    </div>
                  </div>
                </div>

                {/* Budget Health */}
                <div className="rounded-2xl border border-white/[0.08] bg-slate-900/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget Health</h4>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-display text-xl font-bold text-white">₹23,400</span>
                    <span className="text-xs text-slate-400 font-mono">of ₹28,000</span>
                  </div>
                  <div className="mt-2.5 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '83%' }} />
                  </div>
                  <p className="mt-2 text-[11px] text-emerald-400">✓ 16% under target budget</p>
                </div>

                <Link
                  to="/plan"
                  id="showcase-cta"
                  className="btn-primary block w-full rounded-xl py-3 text-center font-display text-xs font-semibold text-slate-950"
                >
                  Customize This Plan →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────── BUDGET SIMULATOR ────── */}
      <section id="simulator" className="relative z-10 py-24 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="badge-gold text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
              ✦ Live Cost Calibrator
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">
              Interactive Budget Estimator
            </h2>
            <p className="text-slate-400 mt-2 text-sm max-w-xl mx-auto">
              Adjust travelers, duration, and dining style to see exact real-world costs calculated in real time.
            </p>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            <div className="grid md:grid-cols-2 gap-0">

              {/* Controls */}
              <div className="p-8 space-y-6 border-r border-white/[0.08]">
                {/* Duration */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span>Trip Duration</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {simDays === 1 ? 'Single Day' : simDays <= 3 ? 'Weekend Getaway' : simDays <= 6 ? 'Vacation' : 'Extended Holiday'}
                      </span>
                    </label>
                    <span className="font-display text-base font-bold text-amber-400 font-mono">
                      {simDays} {simDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                    {[
                      { d: 1, l: '1D' },
                      { d: 3, l: '3D Weekend' },
                      { d: 5, l: '5D' },
                      { d: 7, l: '7D Week' },
                      { d: 10, l: '10D' },
                    ].map((item) => (
                      <button
                        key={item.d}
                        type="button"
                        onClick={() => setSimDays(item.d)}
                        className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition cursor-pointer text-center truncate ${
                          simDays === item.d
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {item.l}
                      </button>
                    ))}
                  </div>

                  {/* Range Slider with Exact Gradient Fill */}
                  <div className="relative py-1">
                    <input
                      id="sim-days"
                      type="range"
                      min="1"
                      max="10"
                      value={simDays}
                      onChange={(e) => setSimDays(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((simDays - 1) / 9) * 100}%, rgba(255,255,255,0.08) ${((simDays - 1) / 9) * 100}%, rgba(255,255,255,0.08) 100%)`,
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Accurately Positioned Markers */}
                  <div className="relative w-full h-4 mt-1 text-[10px] text-slate-500 font-mono select-none">
                    {[
                      { d: 1, label: '1 day', align: 'left' },
                      { d: 3, label: '3d' },
                      { d: 5, label: '5 days' },
                      { d: 7, label: '7d' },
                      { d: 10, label: '10 days', align: 'right' },
                    ].map((m) => {
                      const pct = ((m.d - 1) / 9) * 100
                      const isSelected = simDays === m.d
                      return (
                        <button
                          key={m.d}
                          type="button"
                          onClick={() => setSimDays(m.d)}
                          style={{ left: `${pct}%` }}
                          className={`absolute top-0 transition-colors cursor-pointer ${
                            m.align === 'left'
                              ? 'translate-x-0'
                              : m.align === 'right'
                              ? '-translate-x-full'
                              : '-translate-x-1/2'
                          } ${isSelected ? 'text-amber-400 font-bold' : 'hover:text-slate-300'}`}
                        >
                          {m.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* People */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span>Group Size</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {simPeople === 1
                          ? 'Solo Explorer'
                          : simPeople === 2
                          ? 'Couple / Duo'
                          : simPeople <= 4
                          ? 'Family / Small Group'
                          : 'Large Group'}
                      </span>
                    </label>
                    <span className="font-display text-base font-bold text-amber-400 font-mono">
                      {simPeople} {simPeople === 1 ? 'Traveller' : 'Travellers'}
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                    {[
                      { p: 1, l: 'Solo (1)' },
                      { p: 2, l: 'Couple (2)' },
                      { p: 4, l: 'Family (4)' },
                      { p: 8, l: 'Group (8)' },
                    ].map((item) => (
                      <button
                        key={item.p}
                        type="button"
                        onClick={() => setSimPeople(item.p)}
                        className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition cursor-pointer text-center truncate ${
                          simPeople === item.p
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {item.l}
                      </button>
                    ))}
                  </div>

                  {/* Range Slider with Exact Gradient Fill */}
                  <div className="relative py-1">
                    <input
                      id="sim-people"
                      type="range"
                      min="1"
                      max="8"
                      value={simPeople}
                      onChange={(e) => setSimPeople(Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${((simPeople - 1) / 7) * 100}%, rgba(255,255,255,0.08) ${((simPeople - 1) / 7) * 100}%, rgba(255,255,255,0.08) 100%)`,
                      }}
                      className="w-full"
                    />
                  </div>

                  {/* Accurately Positioned Markers: EXACT percentage so thumb is directly above text */}
                  <div className="relative w-full h-4 mt-1 text-[10px] text-slate-500 font-mono select-none">
                    {[
                      { p: 1, label: '1 (Solo)', align: 'left' },
                      { p: 2, label: '2' },
                      { p: 4, label: '4 (Family)' },
                      { p: 6, label: '6' },
                      { p: 8, label: '8 (Group)', align: 'right' },
                    ].map((m) => {
                      const pct = ((m.p - 1) / 7) * 100
                      const isSelected = simPeople === m.p
                      return (
                        <button
                          key={m.p}
                          type="button"
                          onClick={() => setSimPeople(m.p)}
                          style={{ left: `${pct}%` }}
                          className={`absolute top-0 transition-colors cursor-pointer ${
                            m.align === 'left'
                              ? 'translate-x-0'
                              : m.align === 'right'
                              ? '-translate-x-full'
                              : '-translate-x-1/2'
                          } ${isSelected ? 'text-amber-400 font-bold' : 'hover:text-slate-300'}`}
                        >
                          {m.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Dining */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Dining Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'veg_only', l: '🌱 Pure Veg Only' },
                      { v: 'non_veg', l: '🍗 Non-Veg Included' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setSimFoodType(opt.v)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          simFoodType === opt.v
                            ? 'border border-amber-500/80 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30'
                            : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total output */}
              <div className="p-8 flex flex-col justify-between bg-slate-900/30">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Calculated Total Group Spend
                  </p>
                  <div className="mt-1">
                    <span className="font-display text-4xl sm:text-5xl font-bold text-white">
                      {inr(estimatedTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    ≈ {inr(Math.round(estimatedTotal / simPeople))} per traveller
                  </p>

                  {/* Breakdown */}
                  <div className="mt-6 space-y-2.5 text-xs">
                    {[
                      { icon: '🏨', label: `Hotel (${simDays - 1} nights)`, val: totalStay },
                      { icon: '🍽️', label: `Dining (${simFoodType === 'veg_only' ? 'Pure Veg' : 'Non-Veg'})`, val: totalFood },
                      { icon: '🚕', label: 'Local Cabs & Transit', val: totalTransit },
                      { icon: '🎟️', label: 'Monuments & Activities', val: totalActivities },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-400">{item.icon} {item.label}</span>
                        <span className="font-semibold text-white font-mono">{inr(item.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  id="sim-generate-btn"
                  onClick={() => navigate('/plan', {
                    state: { duration_days: simDays, group_size: simPeople, total_budget: estimatedTotal, food_preference: simFoodType },
                  })}
                  className="btn-primary mt-8 w-full rounded-xl py-3.5 font-display text-sm font-semibold text-slate-950 cursor-pointer"
                >
                  Generate Plan with These Numbers →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────── FEATURES ────── */}
      <section className="relative z-10 py-24 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <span className="badge-gold text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
              ✦ Built For Real Travelers
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">
              Everything you need, nothing you don't
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="glass-card rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.12] transition"
              >
                <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl mb-4">
                  {feat.icon}
                </div>
                <h3 className="font-display text-base font-semibold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── POPULAR BLUEPRINTS ────── */}
      <section className="relative z-10 py-24 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="badge-gold text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
                ✦ Inspiring Blueprints
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-3">Popular Getaways</h2>
            </div>
            <Link to="/plan" className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition flex items-center gap-1">
              Custom destination →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTrips.map((trip) => (
              <div
                key={trip.destination}
                className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] hover:border-amber-500/30 transition flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{trip.emoji}</span>
                    <span className="badge-gold text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {trip.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-white leading-tight">{trip.destination}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{trip.days} Days · {inr(trip.budget)}</p>

                  <div className="mt-3 space-y-1 text-xs border-t border-white/[0.06] pt-3">
                    <p className="text-slate-400">
                      Stay: <span className="text-white font-medium">{trip.hotel}</span>
                    </p>
                    <p className="text-emerald-400 font-medium">{trip.foodLabel}</p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => launchQuickPlan(trip)}
                    className="btn-primary w-full rounded-xl py-2.5 text-center text-xs font-semibold text-slate-950 cursor-pointer"
                  >
                    Plan this trip →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── CTA BANNER ────── */}
      <section className="relative z-10 py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="glass-card rounded-3xl p-10 sm:p-14 border border-white/10 space-y-4">
            <Logo className="h-12 w-12 mx-auto" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Ready to explore the world?
            </h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto">
              Build your next trip in under 60 seconds with verified hotels, exact budgets, and tailored dining.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/plan"
                id="cta-banner-plan"
                className="btn-primary rounded-full px-8 py-3.5 font-display text-sm font-semibold text-slate-950"
              >
                Plan My Trip Now ✈️
              </Link>
              <Link
                to="/signup"
                id="cta-banner-signup"
                className="btn-ghost rounded-full px-7 py-3.5 font-display text-sm font-medium text-white"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
