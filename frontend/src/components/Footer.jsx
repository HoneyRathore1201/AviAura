import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] bg-[#070A10]/95 backdrop-blur-2xl text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-16 space-y-12">
        {/* ── Engineering & Creator Showcase ── */}
        <div className="rounded-3xl p-8 sm:p-10 border border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Tag */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono font-semibold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                A Fully Real-World Working Project
              </div>
              <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                Architected & Engineered by
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-sm sm:text-right font-light">
              Designed from the ground up with high-concurrency async APIs, strict budget calibration, and dual-engine AI orchestration.
            </p>
          </div>

          {/* Creators Cards */}
          <div className="grid md:grid-cols-2 gap-6 pt-8">
            {/* Creator 1: Honey Rathore */}
            <div className="rounded-2xl p-6 border border-white/[0.08] bg-slate-900/50 hover:border-amber-500/40 transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Universal Blue User Silhouette Placeholder */}
              <div className="relative shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10 group-hover:scale-105 transition-transform">
                  <svg className="h-7 w-7 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 18a7 7 0 0114 0H5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#070A10]" title="Active Developer" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Honey Rathore
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Lead Creator
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Lead Architect & Full-Stack Engineer
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.linkedin.com/in/honeyrathore1201"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0A66C2]/15 text-[#38BDF8] hover:bg-[#0A66C2]/30 border border-[#0A66C2]/40 transition-colors cursor-pointer"
                  >
                    {/* LinkedIn SVG */}
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0-.02-3.3 1.65 1.65 0 0 0 .02 3.3m1.4 9.74v-8.37H5.06v8.37z" />
                    </svg>
                    <span>Connect on LinkedIn</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Creator 2: Kashish Tomar */}
            <div className="rounded-2xl p-6 border border-white/[0.08] bg-slate-900/50 hover:border-amber-500/40 transition-all group flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Universal Blue User Silhouette Placeholder */}
              <div className="relative shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10 group-hover:scale-105 transition-transform">
                  <svg className="h-7 w-7 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 18a7 7 0 0114 0H5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#070A10]" title="Active Developer" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    Kashish Tomar
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Co-Creator
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Co-Developer & Software Engineer
                </p>
                <div className="pt-2">
                  <a
                    href="https://www.linkedin.com/in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.65 1.65 0 1 0-.02-3.3 1.65 1.65 0 0 0 .02 3.3m1.4 9.74v-8.37H5.06v8.37z" />
                    </svg>
                    <span>LinkedIn Profile</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Footer Navigation & Brand ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/[0.06] text-xs">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 shrink-0" />
            <div>
              <span className="font-display font-bold text-white text-sm">Aviaura</span>
              <p className="text-[11px] text-slate-400">Smart Travel Architecture · AI-Powered Itineraries</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <Link to="/plan" className="hover:text-amber-400 transition-colors">Plan Trip</Link>
            <Link to="/explore" className="hover:text-amber-400 transition-colors">Explore</Link>
            <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
            <Link to="/support" className="hover:text-amber-400 transition-colors">Support Desk</Link>
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center md:text-right">
            © {new Date().getFullYear()} Aviaura. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
