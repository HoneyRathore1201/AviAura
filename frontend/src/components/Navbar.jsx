import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const linkClass = ({ isActive }) =>
    `relative px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
      isActive
        ? 'text-white'
        : 'text-slate-400 hover:text-white'
    }`

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/plan', label: 'Plan Trip' },
    { to: '/explore', label: 'Explore' },
    { to: '/about', label: 'About' },
    { to: '/support', label: 'Support' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
          scrolled
            ? 'glass shadow-2xl border border-white/[0.08]'
            : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <Logo className="h-9 w-9 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight text-white">
              Aviaura
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-amber-400 mt-0.5">
              SMART TRAVEL
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (5 sections) */}
        <div className="hidden lg:flex items-center gap-1 glass rounded-full px-2 py-1.5 border border-white/[0.08]">
          {navLinks.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/dashboard" className={linkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">Saved Trips</span>
                </>
              )}
            </NavLink>
          )}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full glass px-3.5 py-1.5 border border-white/[0.08]">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-200">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="btn-ghost rounded-full px-4 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="btn-primary rounded-full px-5 py-2 text-sm font-semibold text-slate-950"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden relative h-9 w-9 flex flex-col items-center justify-center gap-1.5 text-slate-300"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-2 rounded-2xl glass p-4 border border-white/[0.08] space-y-1.5"
          >
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="block px-3 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/[0.04] rounded-lg"
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-sm font-medium text-slate-200 hover:text-white hover:bg-white/[0.04] rounded-lg">
                  Saved Trips
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-rose-400 hover:bg-white/[0.04] rounded-lg"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2">
                <Link to="/login" className="flex-1 text-center py-2 text-sm text-slate-300">
                  Sign in
                </Link>
                <Link to="/signup" className="flex-1 text-center btn-primary rounded-xl py-2 text-sm font-semibold text-slate-950">
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
