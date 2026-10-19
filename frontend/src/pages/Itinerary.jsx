import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard'
import TripMap from '../components/TripMap'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const inr = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)

function loadPlan(state) {
  if (state?.plan) return state.plan
  const raw = sessionStorage.getItem('aviaura_last_trip')
  return raw ? JSON.parse(raw) : null
}

export default function Itinerary() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [plan, setPlan] = useState(() => loadPlan(state))
  const [activeDay, setActiveDay] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const pct = useMemo(() => {
    if (!plan || !plan.budget) return 0
    return Math.min(
      100,
      Math.round((plan.budget.total_estimated / plan.budget.user_budget) * 100)
    )
  }, [plan])

  if (!plan) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-32 pb-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500/10 text-2xl text-amber-400 border border-amber-500/20">
          🧭
        </div>
        <h1 className="font-display text-2xl font-bold text-white">No trip plan found</h1>
        <p className="mt-2 text-sm text-slate-400">Generate a new itinerary to see your day-by-day plan.</p>
        <Link
          to="/plan"
          className="btn-primary mt-6 inline-block rounded-full px-6 py-2.5 font-display text-xs font-semibold text-slate-950"
        >
          Plan a Trip Now
        </Link>
      </div>
    )
  }

  async function save() {
    if (!token) {
      navigate('/login', { state: { from: '/itinerary' } })
      return
    }
    setSaving(true)
    setMessage('')
    try {
      const { data } = await api.post('/api/trips', plan)
      setPlan(data)
      sessionStorage.setItem('aviaura_last_trip', JSON.stringify(data))
      setMessage('✓ Successfully saved to your Dashboard!')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Could not save trip.')
    } finally {
      setSaving(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-16">
      {/* Header Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-gold rounded-full px-3 py-0.5 text-xs font-semibold">
              {plan.duration_days} Days · {plan.group_size} Travellers
            </span>
            <span className="text-xs text-slate-400 font-mono">{plan.start_date}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            {plan.destination}
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-300 md:text-sm">
            {plan.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-ghost rounded-full px-4 py-2 text-xs font-medium text-slate-200 transition-all cursor-pointer"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary rounded-full px-5 py-2 text-xs font-semibold text-slate-950 disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Saving…' : plan.trip_id ? '✓ Saved' : token ? 'Save to Dashboard' : 'Log in to Save'}
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-300">
          {message}
        </div>
      )}

      {/* Main Grid: Days on Left, Widgets on Right */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        {/* Days List */}
        <div className="space-y-5 lg:col-span-8">
          {plan.days.map((day) => (
            <div key={day.day_number} className="glass-card rounded-2xl p-6 border border-white/10">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left cursor-pointer"
                onClick={() =>
                  setActiveDay(activeDay === day.day_number ? null : day.day_number)
                }
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    Day {day.day_number} · {day.date}
                  </span>
                  <h2 className="mt-0.5 font-display text-lg font-bold text-white md:text-xl">
                    {day.theme}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="font-display text-sm font-semibold text-white">
                    {inr(day.day_total)}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {activeDay === day.day_number ? 'Hide map pin' : 'Click to highlight map'}
                  </p>
                </div>
              </button>

              <div className="mt-5 space-y-3 border-t border-white/[0.08] pt-4">
                {day.items.map((item, idx) => {
                  const isFood = item.category === 'food' || item.place_type === 'restaurant'
                  const isLodging = item.category === 'lodging' || item.place_type === 'hotel'

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-4 transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Tags row */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold text-amber-400 font-mono">
                              {item.time_slot}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span className="text-[11px] font-medium text-slate-300">
                              {item.location_name}
                            </span>

                            {/* Dietary & venue badges */}
                            {item.dietary_tag && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  item.dietary_tag.toLowerCase().includes('pure veg')
                                    ? 'badge-emerald'
                                    : 'badge-gold'
                                }`}
                              >
                                {item.dietary_tag}
                              </span>
                            )}

                            {isLodging && (
                              <span className="badge-sky rounded-full px-2 py-0.5 text-[10px] font-semibold">
                                🏨 Stay / Hotel
                              </span>
                            )}

                            {item.rating && (
                              <span className="rounded-full bg-amber-500/20 text-amber-300 px-2 py-0.5 text-[10px] font-semibold">
                                ★ {item.rating}
                              </span>
                            )}
                          </div>

                          {/* Activity / Venue Name */}
                          <h3 className="mt-1.5 font-display text-sm font-semibold text-white md:text-base">
                            {item.activity_name}
                          </h3>

                          {/* Notes */}
                          {item.notes && (
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">
                              {item.notes}
                            </p>
                          )}

                          {item.indoor_alternative && (
                            <p className="mt-1 text-[11px] text-sky-400">
                              ☔ Rain backup: {item.indoor_alternative}
                            </p>
                          )}
                        </div>

                        {/* Estimated Cost */}
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-200">
                            {item.estimated_cost === 0 ? 'Free' : inr(item.estimated_cost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: Map, Weather, Budget */}
        <div className="space-y-5 lg:col-span-4">
          {/* Map Preview */}
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Interactive Route Map
            </h3>
            <TripMap plan={plan} activeDay={activeDay} />
            <p className="mt-2 text-[11px] text-slate-400">
              {activeDay
                ? `Showing Day ${activeDay} pins. Tap day header again to show all.`
                : 'All stops plotted in visit order.'}
            </p>
          </div>

          {/* Budget Tracker */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-400">
                Expense Tracker
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  plan.budget.over_budget
                    ? 'badge-rose'
                    : 'badge-emerald'
                }`}
              >
                {plan.budget.over_budget ? 'Exceeds Target' : 'Within Budget'}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-bold text-white">
                {inr(plan.budget.total_estimated)}
              </span>
              <span className="text-xs text-slate-400 font-mono">of {inr(plan.budget.user_budget)}</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                style={{ width: `${pct}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  plan.budget.over_budget ? 'bg-rose-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{plan.budget.note}</p>

            {/* Category breakdown */}
            <div className="space-y-1.5 border-t border-white/[0.08] pt-3 text-xs">
              {Object.entries(plan.budget.by_category || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-300">
                  <span className="capitalize text-slate-400">{k}</span>
                  <span className="font-medium text-white">{inr(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Widget */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-3">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-400">
              OpenWeather Live Forecast
            </h3>
            <div className="space-y-2">
              {plan.weather.map((w) => (
                <div
                  key={w.date}
                  className="rounded-xl border border-white/[0.06] bg-slate-900/60 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{w.date}</span>
                    {w.available ? (
                      <span className="font-semibold text-amber-400 font-mono">
                        {w.temp_min}° – {w.temp_max}°C
                      </span>
                    ) : (
                      <span className="text-slate-500">beyond 5d</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] capitalize text-slate-400">
                    {w.description || w.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
