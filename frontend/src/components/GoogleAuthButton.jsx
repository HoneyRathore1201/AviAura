import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function GoogleAuthButton({ redirectTo = '/dashboard' }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const googleBtnRef = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleCredentialResponse = async (response) => {
    if (!response.credential) {
      setError('No credential received from Google.')
      return
    }
    await processToken(response.credential)
  }

  const processToken = async (credential) => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/google', { credential })
      login(data)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Google Sign-In for instant testing before Client ID is provided
  const handleDemoSignIn = async () => {
    await processToken('demo_traveler_credential_' + Date.now())
  }

  useEffect(() => {
    if (!googleClientId) return

    // Load Google Identity Services script if not present
    const loadGIS = () => {
      if (window.google?.accounts?.id) {
        initGIS()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGIS
      script.onerror = () => setError('Failed to load Google Identity Services.')
      document.body.appendChild(script)
    }

    const initGIS = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = ''
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: 320,
            logo_alignment: 'left',
          })
        }
      } catch (err) {
        console.error('Google Identity init error:', err)
      }
    }

    loadGIS()
  }, [googleClientId])

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Real Google GIS button mount container */}
      {googleClientId && (
        <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />
      )}

      {/* Primary Custom Google Sign-In Button */}
      {(!googleClientId || !window.google?.accounts?.id) && (
        <button
          type="button"
          onClick={googleClientId ? () => window.google?.accounts?.id?.prompt() : handleDemoSignIn}
          disabled={loading}
          className="w-full max-w-sm rounded-full border border-white/15 bg-white text-slate-900 hover:bg-slate-100 font-display text-sm font-semibold py-3.5 px-6 flex items-center justify-center gap-3.5 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
        >
          {/* Authentic Google Multi-Color SVG Icon */}
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Authenticating…' : 'Continue with Google'}</span>
        </button>
      )}

      {/* Client ID Setup Notice if not configured */}
      {!googleClientId && (
        <div className="w-full max-w-sm rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-left">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 text-xs">ℹ</span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              <strong>Google Client ID setup:</strong> Provide your Google OAuth Client ID to activate real Google popups.
              Clicking <em>Continue with Google</em> above currently logs in via instant developer test mode.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full max-w-sm rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 text-center">
          {error}
        </div>
      )}
    </div>
  )
}
