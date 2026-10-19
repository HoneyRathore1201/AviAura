import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StarField from '../components/StarField'

const destinations = [
  {
    name: 'Jaipur, Rajasthan',
    region: 'Asia',
    category: 'heritage',
    days: 3,
    budget: 28000,
    emoji: '🏯',
    tag: 'Royalty & Architecture',
    season: 'Oct – Mar',
    hotel: 'Umaid Bhawan Heritage Haveli',
    food: 'veg_only',
    foodHighlight: '🌱 100% Pure Veg Dal Baati & Ghewar at LMB',
    highlights: ['Amber Fort Mosaic', 'Hawa Mahal View', 'Bapu Bazaar Textiles'],
  },
  {
    name: 'Kyoto, Japan',
    region: 'Asia',
    category: 'heritage',
    days: 5,
    budget: 135000,
    emoji: '⛩️',
    tag: 'Temples & Ryokan',
    season: 'Mar – May & Oct – Nov',
    hotel: 'Ryokan Gion Sano',
    food: 'all',
    foodHighlight: '🍜 Nishiki Market Food Walk & Matcha Tea Ceremonies',
    highlights: ['Fushimi Inari Torii', 'Arashiyama Bamboo Grove', 'Kinkaku-ji Gold Pavilion'],
  },
  {
    name: 'Santorini, Greece',
    region: 'Europe',
    category: 'coastal',
    days: 4,
    budget: 125000,
    emoji: '🏛️',
    tag: 'Cliffside Caldera',
    season: 'Apr – Oct',
    hotel: 'Oia Sunset Cave Suites',
    food: 'all',
    foodHighlight: '🍷 Sunset Dining overlooking Aegean Sea',
    highlights: ['Oia Blue Domes', 'Ammoudi Bay Fresh Catch', 'Red Beach Trail'],
  },
  {
    name: 'Swiss Alps & Zurich',
    region: 'Europe',
    category: 'nature',
    days: 5,
    budget: 165000,
    emoji: '🏔️',
    tag: 'Alpine Glaciers & Lakes',
    season: 'Jun – Sep & Dec – Mar',
    hotel: 'Hotel Schweizerhof & Alpine Chalet',
    food: 'all',
    foodHighlight: '🧀 Traditional Swiss Cheese Fondue & Raclette',
    highlights: ['Lake Zurich Cruise', 'Mount Rigi Cogwheel Train', 'Old Town Walk'],
  },
  {
    name: 'North & South Goa',
    region: 'Asia',
    category: 'coastal',
    days: 4,
    budget: 36000,
    emoji: '🏖️',
    tag: 'Coastal & Portuguese Heritage',
    season: 'Nov – Feb',
    hotel: 'Santana Beach Resort',
    food: 'non_veg',
    foodHighlight: '🍗 Coastal Prawn Curry & Bebinca Sweets',
    highlights: ['Fontainhas Latin Quarter', 'Anjuna Sunset Cliffs', 'Fisherman’s Wharf'],
  },
  {
    name: 'Manali & Solang Valley',
    region: 'Asia',
    category: 'nature',
    days: 5,
    budget: 32000,
    emoji: '❄️',
    tag: 'Snow Peaks & Cafes',
    season: 'Year-Round',
    hotel: 'The Himalayan Boutique Resort',
    food: 'all',
    foodHighlight: '🥑 Old Manali Himalayan Trout & Bakery Cafes',
    highlights: ['Solang Valley Snow Point', 'Jogini Waterfall Trek', 'Hadimba Temple Pine Forest'],
  },
]

const filterTabs = [
  { id: 'all', label: 'All Destinations' },
  { id: 'heritage', label: '🏯 Heritage & Royalty' },
  { id: 'coastal', label: '🏖️ Coastal Escapes' },
  { id: 'nature', label: '🏔️ Alpine & Nature' },
]

export default function Explore() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = destinations.filter(
    (d) => activeFilter === 'all' || d.category === activeFilter
  )

  const inr = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const launchPlan = (dest) => {
    navigate('/plan', {
      state: {
        destination: dest.name.split(',')[0],
        duration_days: dest.days,
        total_budget: dest.budget,
        food_preference: dest.food,
      },
    })
  }

  return (
    <div className="relative min-h-screen pt-28 pb-20 px-4">
      <StarField count={45} />

      <div className="relative z-10 mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="badge-gold inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Curated World Blueprints
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Explore Handcrafted Itineraries
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-300 font-light">
            Every blueprint is pre-calibrated with verified boutique stays, local culinary gems, and exact whole-group budgets.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'glass text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <div
              key={dest.name}
              className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{dest.emoji}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-full">
                      🗓️ {dest.season}
                    </span>
                    <span className="badge-gold text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {dest.tag}
                    </span>
                  </div>
                </div>

                {/* Title & Budget */}
                <div>
                  <h3 className="font-display text-xl font-bold text-white leading-tight">
                    {dest.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-amber-400 font-mono font-bold text-base">
                      {inr(dest.budget)}
                    </span>
                    <span className="text-xs text-slate-400">
                      for {dest.days} days (2 travelers)
                    </span>
                  </div>
                </div>

                {/* Hotel & Food */}
                <div className="rounded-2xl border border-white/[0.06] bg-slate-900/50 p-3.5 space-y-2 text-xs">
                  <p className="text-slate-300">
                    <span className="text-slate-500">🏨 Stay: </span>
                    <strong className="text-white font-medium">{dest.hotel}</strong>
                  </p>
                  <p className="text-amber-300/90 leading-tight">
                    {dest.foodHighlight}
                  </p>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5">
                  {dest.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => launchPlan(dest)}
                  className="btn-primary w-full rounded-xl py-3 font-display text-xs font-semibold text-slate-950 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Customize & Plan This Trip</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
