import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/client'
import StarField from '../components/StarField'

const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const destinationEmojis = {
  default: '🗺️', jaipur: '🏯', goa: '🏖️', manali: '🏔️', kyoto: '⛩️',
  bali: '🌴', paris: '🗼', dubai: '🏙️', maldives: '🌊', kashmir: '❄️',
}

function getTripEmoji(destination = '') {
  const d = destination.toLowerCase()
  return Object.entries(destinationEmojis).find(([k]) => d.includes(k))?.[1] || '✈️'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    api.get('/api/trips')
      .then((res) => { if (active) { setTrips(res.data); setLoaded(true) } })
      .catch((err) => { if (active) { setError(err.response?.data?.detail || 'Could not load trips'); setLoaded(true) } })
    return () => { active = false }
  }, [])

  async function remove(id) {
    if (!confirm('Delete this saved trip?')) return
    setDeletingId(id)
    await api.delete(`/api/trips/${id}`)
    setTrips((t) => t.filter((x) => x.trip_id !== id))
    setDeletingId(null)
  }

  function openTrip(plan) {
    sessionStorage.setItem('aviaura_last_trip', JSON.stringify(plan))
    navigate('/itinerary', { state: { plan } })
  }

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4">
      <StarField count={40} />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 border-b border-white/[0.08] pb-6">
          <div>
            <span className="badge-gold text-xs font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full">
              ✦ Your Travel Vault
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mt-3">
              Saved Trips
            </h1>
            <p className="text-slate-400 mt-1.5 text-sm">
              {trips.length > 0
                ? `${trips.length} saved ${trips.length === 1 ? 'itinerary' : 'itineraries'} · Tap to re-open`
                : 'Your curated itineraries will appear here'}
            </p>
          </div>
          <Link
            to="/plan"
            id="dashboard-new-trip"
            className="btn-primary rounded-xl px-5 py-2.5 font-display text-sm font-semibold text-slate-950 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Plan New Trip</span>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            ⚠ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {!loaded && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 border border-white/10 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                <div className="h-6 w-44 bg-white/10 rounded mb-2" />
                <div className="h-4 w-32 bg-white/10 rounded mb-6" />
                <div className="flex gap-2">
                  <div className="h-9 flex-1 bg-white/10 rounded-xl" />
                  <div className="h-9 w-20 bg-white/10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {loaded && trips.length === 0 && (
          <div className="glass-card rounded-3xl py-16 px-8 text-center border border-white/10 max-w-md mx-auto">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="font-display text-xl font-bold text-white mb-2">No saved trips yet</h2>
            <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto">
              Generate your first bespoke itinerary and save it here to access anytime.
            </p>
            <Link
              to="/plan"
              id="dashboard-empty-cta"
              className="btn-primary rounded-xl px-6 py-2.5 font-display text-xs font-semibold text-slate-950 inline-flex items-center gap-2"
            >
              Plan My First Trip →
            </Link>
          </div>
        )}

        {/* Trip cards grid */}
        <AnimatePresence>
          {loaded && trips.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => {
                const emoji = getTripEmoji(trip.destination)
                const isDeleting = deletingId === trip.trip_id

                return (
                  <motion.div
                    key={trip.trip_id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card rounded-2xl overflow-hidden border border-white/10"
                  >
                    {/* Amber top line */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-600" />

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                          {trip.start_date || 'Flexible'}
                        </span>
                        <span className="text-2xl">{emoji}</span>
                      </div>

                      <h2 className="font-display text-lg font-bold text-white leading-tight">
                        {trip.destination}
                      </h2>

                      {/* Meta badges */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="badge-sky text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                          {trip.duration_days} days
                        </span>
                        <span className="badge-gold text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-mono">
                          {inr(trip.total_budget)}
                        </span>
                        <span className="badge-emerald text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                          {trip.group_size} {trip.group_size === 1 ? 'traveller' : 'travellers'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openTrip(trip)}
                          id={`trip-open-${trip.trip_id}`}
                          className="btn-primary flex-1 rounded-xl py-2.5 text-xs font-semibold text-slate-950 cursor-pointer"
                        >
                          Open Itinerary ↗
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(trip.trip_id)}
                          disabled={isDeleting}
                          id={`trip-delete-${trip.trip_id}`}
                          className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isDeleting ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
