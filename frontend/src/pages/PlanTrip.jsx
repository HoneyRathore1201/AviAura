import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api/client'
import ItinerarySkeleton from '../components/Skeleton'

const today = new Date().toISOString().slice(0, 10)

const destinationPresets = [
  'Jaipur',
  'Goa',
  'Manali',
  'Kyoto',
  'Udaipur',
  'Kerala Backwaters',
  'Santorini',
  'Swiss Alps',
]

export default function PlanTrip() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialData = location.state || {}

  const [form, setForm] = useState({
    destination: initialData.destination || '',
    start_date: today,
    duration_days: initialData.duration_days || 4,
    total_budget: initialData.total_budget || 35000,
    group_size: initialData.group_size || 2,
    currency: 'INR',
    preferences: {
      dietary: 'none',
      food_preference: initialData.food_preference || 'all',
      stay_style: 'boutique',
      activity_type: 'balanced',
      pace: 'moderate',
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setPref = (key, value) =>
    setForm((f) => ({ ...f, preferences: { ...f.preferences, [key]: value } }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        duration_days: Number(form.duration_days),
        total_budget: Number(form.total_budget),
        group_size: Number(form.group_size),
      }
      const { data } = await api.post('/api/itinerary/generate', payload)
      sessionStorage.setItem('aviaura_last_trip', JSON.stringify(data))
      navigate('/itinerary', { state: { plan: data } })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Could not generate a plan.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-24">
        <div className="glass-card rounded-3xl p-8 text-center border border-white/10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 text-xl font-bold border border-amber-500/20 animate-pulse">
            ✦
          </div>
          <h2 className="font-display text-2xl font-bold text-white">
            Curating Your Bespoke Itinerary…
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            Finding verified hotels and authentic dining spots, checking live weather forecasts,
            and calibrating day-by-day budget allocations.
          </p>
        </div>
        <ItinerarySkeleton />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen px-4 pt-28 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        {/* Title Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium tracking-wide badge-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Smart Travel Architect
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Design your journey
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Personalized dining, verified stays, and exact budget balancing.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={onSubmit}>
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Destination City or Region
              </label>
              <input
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/25 transition-all"
                placeholder="e.g. Jaipur, North Goa, Kyoto, Manali, Zurich…"
                value={form.destination}
                onChange={(e) => setField('destination', e.target.value)}
              />

              {/* Quick suggestion pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-400">Quick ideas:</span>
                {destinationPresets.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setField('destination', city)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      form.destination.toLowerCase() === city.toLowerCase()
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'border border-slate-700/70 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates & Duration */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Trip Start Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/25 transition-all"
                  value={form.start_date}
                  onChange={(e) => setField('start_date', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Duration (1 to 10 Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/25 transition-all"
                  value={form.duration_days}
                  onChange={(e) => setField('duration_days', e.target.value)}
                />
              </div>
            </div>

            {/* Travellers & Total Budget */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Group Size (Persons)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/25 transition-all"
                  value={form.group_size}
                  onChange={(e) => setField('group_size', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Total Budget for Group (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 pl-8 pr-4 py-2.5 text-sm font-semibold text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/25 transition-all"
                    value={form.total_budget}
                    onChange={(e) => setField('total_budget', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Dining Preference Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                    <span>🍽️</span> Restaurant & Dining Preference
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Aviaura selects verified real restaurants strictly honoring your culinary guidelines.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { id: 'veg_only', label: '🌱 Pure Veg Only', desc: '100% vegetarian bhojanalayas & cafes' },
                  { id: 'non_veg', label: '🍗 Non-Veg Specialties', desc: 'Authentic local meats & seafood' },
                  { id: 'all', label: '🍽️ All / Balanced', desc: 'Mix of authentic regional dining' },
                  { id: 'jain', label: '✨ Jain Friendly', desc: 'Strict no onion / root veg spots' },
                  { id: 'vegan', label: '🥑 Vegan Friendly', desc: 'Plant-based dining options' },
                ].map((opt) => {
                  const active = form.preferences.food_preference === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPref('food_preference', opt.id)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-amber-500/80 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                          : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <p className={`text-xs font-semibold ${active ? 'text-amber-400' : 'text-slate-200'}`}>
                        {opt.label}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                        {opt.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Lodging & Stay Style */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
              <h3 className="font-display text-sm font-semibold text-white flex items-center gap-2">
                <span>🏨</span> Stay & Hotel Style
              </h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { id: 'budget', label: '🎒 Budget Hostel / Stay', desc: 'Zostel, boutique hostels, clean budget rooms' },
                  { id: 'boutique', label: '🏨 Boutique & Heritage', desc: 'Charming mid-tier havelis & hotels' },
                  { id: 'luxury', label: '👑 Luxury Resort', desc: 'Premium 4-5 star resorts & palaces' },
                ].map((opt) => {
                  const active = form.preferences.stay_style === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPref('stay_style', opt.id)}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-amber-500/80 bg-amber-500/10 text-white shadow-sm ring-1 ring-amber-500/30'
                          : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <p className={`text-xs font-semibold ${active ? 'text-amber-400' : 'text-slate-200'}`}>
                        {opt.label}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                        {opt.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pace and Activity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Travel Pace
                </label>
                <select
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/25 transition-all"
                  value={form.preferences.pace}
                  onChange={(e) => setPref('pace', e.target.value)}
                >
                  <option value="relaxed" className="bg-slate-900 text-white">Relaxed (3 stops/day, calm pace)</option>
                  <option value="moderate" className="bg-slate-900 text-white">Moderate (4-5 stops/day, balanced)</option>
                  <option value="packed" className="bg-slate-900 text-white">Packed (6+ stops/day, see everything)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Activity Focus
                </label>
                <select
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400/25 transition-all"
                  value={form.preferences.activity_type}
                  onChange={(e) => setPref('activity_type', e.target.value)}
                >
                  <option value="balanced" className="bg-slate-900 text-white">Balanced Highlights</option>
                  <option value="culture" className="bg-slate-900 text-white">Culture, Heritage & Architecture</option>
                  <option value="food" className="bg-slate-900 text-white">Culinary & Local Food Trails</option>
                  <option value="nature" className="bg-slate-900 text-white">Nature, Scenic Views & Lakes</option>
                  <option value="adventure" className="bg-slate-900 text-white">Adventure & Treks</option>
                  <option value="nightlife" className="bg-slate-900 text-white">Cafes & Evening Social Spots</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
                {String(error)}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full rounded-xl py-3.5 font-display text-sm font-semibold tracking-wide text-slate-950 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Generate Detailed Itinerary & Budget Plan</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
